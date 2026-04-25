from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.artist import Artist
from models.artwork import Artwork


async def get_by_id(session: AsyncSession, artwork_id: int) -> Artwork | None:
    return await session.get(Artwork, artwork_id)


async def get_by_slug(session: AsyncSession, slug: str) -> Artwork | None:
    """`artwork.slug` is unique. Artist + museum eager-loaded via `lazy="joined"`."""
    stmt = select(Artwork).where(Artwork.slug == slug)
    return (await session.execute(stmt)).unique().scalar_one_or_none()


async def list_artworks(
    session: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Artwork], int]:
    # `Artwork.artist` and `Artwork.museum` use lazy="joined" — single query, no N+1.
    items_stmt = (
        select(Artwork)
        .order_by(Artwork.year.asc().nulls_last(), Artwork.title)
        .limit(limit)
        .offset(offset)
    )
    total_stmt = select(func.count()).select_from(Artwork)
    items = list((await session.execute(items_stmt)).unique().scalars().all())
    total = (await session.execute(total_stmt)).scalar_one()
    return items, total


async def search_artworks(session: AsyncSession, *, q: str, limit: int) -> list[Artwork]:
    """Rank artworks by max(word_similarity(q, title), word_similarity(q, artist.name)).

    Joins artists so typing 'picasso' returns his artworks even when his name
    doesn't appear in the title. Uses `%>` (word trigram) instead of `%` —
    handles partial queries like 'starri' that the full-string operator misses.
    """
    title_score = func.word_similarity(q, Artwork.title)
    artist_score = func.word_similarity(q, Artist.name)
    score = func.greatest(title_score, artist_score)

    stmt = (
        select(Artwork)
        .join(Artist, Artwork.artist_id == Artist.id)
        .where(or_(Artwork.title.op("%>")(q), Artist.name.op("%>")(q)))
        .order_by(score.desc())
        .limit(limit)
    )
    return list((await session.execute(stmt)).unique().scalars().all())
