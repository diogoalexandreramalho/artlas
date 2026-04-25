from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.artist import Artist
from models.artwork import Artwork


async def list_artists(
    session: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Artist], int]:
    items_stmt = select(Artist).order_by(Artist.name).limit(limit).offset(offset)
    total_stmt = select(func.count()).select_from(Artist)
    items = list((await session.execute(items_stmt)).scalars().all())
    total = (await session.execute(total_stmt)).scalar_one()
    return items, total


async def get_by_slug(session: AsyncSession, slug: str) -> Artist | None:
    """`artist.slug` is unique."""
    stmt = select(Artist).where(Artist.slug == slug)
    return (await session.execute(stmt)).scalar_one_or_none()


async def list_artworks_by_artist(session: AsyncSession, artist_id: int) -> list[Artwork]:
    """Artworks for an artist's detail page.

    `Artwork.artist` and `.museum` eager-load via `lazy="joined"`.
    """
    stmt = (
        select(Artwork)
        .where(Artwork.artist_id == artist_id)
        .order_by(Artwork.year.asc().nulls_last(), Artwork.title)
    )
    return list((await session.execute(stmt)).unique().scalars().all())


async def search_artists(session: AsyncSession, *, q: str, limit: int) -> list[Artist]:
    """Word-trigram search.

    Uses `name %> q` (== `q <% name`): the GIN trgm_ops index handles partial
    queries like "picaso" or "starri" via word_similarity() with a default 0.6
    threshold. Ranks by `word_similarity(q, name)` so closer matches surface first.
    """
    score = func.word_similarity(q, Artist.name)
    stmt = (
        select(Artist)
        .where(Artist.name.op("%>")(q))
        .order_by(score.desc())
        .limit(limit)
    )
    return list((await session.execute(stmt)).scalars().all())
