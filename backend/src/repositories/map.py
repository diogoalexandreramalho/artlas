from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from models.artist import Artist
from models.artwork import Artwork
from models.museum import Museum


async def list_artworks_in_bbox(
    session: AsyncSession,
    *,
    bbox: tuple[float, float, float, float],
    q: str | None = None,
    city: str | None = None,
    country: str | None = None,
    movement: str | None = None,
) -> list[tuple[Museum, list[Artwork]]]:
    """Museums in `bbox` paired with the artworks that pass the filters.

    Two queries by design:
    - Q1 picks museums (bbox + city/country + must-have-matching-artwork).
    - Q2 loads ONLY the artworks that match `q` / `movement` for those museums.

    Without the split, `selectinload(Museum.artworks)` would eagerly fetch
    every artwork at each museum and the response would show non-matching
    works alongside the matches. Two queries beats N+1 (still bounded by # of
    matching museums) and keeps Python filtering out of the hot path.
    """
    min_lng, min_lat, max_lng, max_lat = bbox

    # Predicate applied to the (Artwork JOIN Artist) row stream.
    artwork_predicate: list[ColumnElement[bool]] = []
    if q:
        artwork_predicate.append(
            or_(Artwork.title.op("%>")(q), Artist.name.op("%>")(q))
        )
    if movement:
        artwork_predicate.append(func.lower(Artist.movement) == movement.lower())

    # Q1: museums in the box (+ optional city/country) that hold at least one
    # artwork passing the artwork-side predicate.
    museum_stmt = (
        select(Museum)
        .where(Museum.longitude.between(min_lng, max_lng))
        .where(Museum.latitude.between(min_lat, max_lat))
    )
    if city:
        museum_stmt = museum_stmt.where(func.lower(Museum.city) == city.lower())
    if country:
        museum_stmt = museum_stmt.where(func.lower(Museum.country) == country.lower())
    if artwork_predicate:
        matching_museum_ids = (
            select(Artwork.museum_id)
            .join(Artist, Artwork.artist_id == Artist.id)
            .where(*artwork_predicate)
        )
        museum_stmt = museum_stmt.where(Museum.id.in_(matching_museum_ids))
    museum_stmt = museum_stmt.order_by(Museum.name)
    museums = list((await session.execute(museum_stmt)).scalars().all())
    if not museums:
        return []

    # Q2: matching artworks for those museums. If no artwork-side filter, this
    # still narrows by `museum_id IN (...)` so we never load unrelated rows.
    artwork_stmt = (
        select(Artwork)
        .options(joinedload(Artwork.artist))
        .join(Artist, Artwork.artist_id == Artist.id)
        .where(Artwork.museum_id.in_([m.id for m in museums]))
    )
    if artwork_predicate:
        artwork_stmt = artwork_stmt.where(*artwork_predicate)
    artwork_stmt = artwork_stmt.order_by(Artwork.year.asc().nulls_last(), Artwork.title)
    artworks = list((await session.execute(artwork_stmt)).unique().scalars().all())

    by_museum: dict[int, list[Artwork]] = {}
    for a in artworks:
        if a.museum_id is not None:
            by_museum.setdefault(a.museum_id, []).append(a)

    # Drop museums that ended up with zero matching artworks (only possible
    # when no artwork-side filter was set AND the museum had no artworks at
    # all — currently never, but kept for safety).
    return [(m, by_museum[m.id]) for m in museums if m.id in by_museum]


async def list_filter_options(session: AsyncSession) -> dict[str, list[str]]:
    """Distinct values for the map's filter dropdowns. Cheap at MVP scale."""
    cities_stmt = (
        select(Museum.city)
        .where(Museum.city.is_not(None))
        .distinct()
        .order_by(Museum.city)
    )
    countries_stmt = (
        select(Museum.country)
        .where(Museum.country.is_not(None))
        .distinct()
        .order_by(Museum.country)
    )
    movements_stmt = (
        select(Artist.movement)
        .where(Artist.movement.is_not(None))
        .distinct()
        .order_by(Artist.movement)
    )

    cities = (await session.execute(cities_stmt)).scalars().all()
    countries = (await session.execute(countries_stmt)).scalars().all()
    movements = (await session.execute(movements_stmt)).scalars().all()
    return {
        "cities": list(cities),
        "countries": list(countries),
        "movements": list(movements),
    }
