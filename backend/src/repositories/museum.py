from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.museum import Museum


async def list_museums(
    session: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Museum], int]:
    items_stmt = select(Museum).order_by(Museum.name).limit(limit).offset(offset)
    total_stmt = select(func.count()).select_from(Museum)
    items = list((await session.execute(items_stmt)).scalars().all())
    total = (await session.execute(total_stmt)).scalar_one()
    return items, total


async def search_museums(session: AsyncSession, *, q: str, limit: int) -> list[Museum]:
    score = func.word_similarity(q, Museum.name)
    stmt = (
        select(Museum)
        .where(Museum.name.op("%>")(q))
        .order_by(score.desc())
        .limit(limit)
    )
    return list((await session.execute(stmt)).scalars().all())
