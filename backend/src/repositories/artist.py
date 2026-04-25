from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.artist import Artist


async def list_artists(
    session: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Artist], int]:
    items_stmt = select(Artist).order_by(Artist.name).limit(limit).offset(offset)
    total_stmt = select(func.count()).select_from(Artist)
    items = list((await session.execute(items_stmt)).scalars().all())
    total = (await session.execute(total_stmt)).scalar_one()
    return items, total


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
