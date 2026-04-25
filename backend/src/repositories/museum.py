from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.artwork import Artwork
from models.museum import Museum


async def get_by_wikidata_id(session: AsyncSession, wikidata_id: str) -> Museum | None:
    """`museum.wikidata_id` is unique."""
    stmt = select(Museum).where(Museum.wikidata_id == wikidata_id)
    return (await session.execute(stmt)).scalar_one_or_none()


async def list_artworks_by_museum(session: AsyncSession, museum_id: int) -> list[Artwork]:
    """Artworks held by a museum.

    `Artwork.artist` and `.museum` eager-load via `lazy="joined"`.
    """
    stmt = (
        select(Artwork)
        .where(Artwork.museum_id == museum_id)
        .order_by(Artwork.year.asc().nulls_last(), Artwork.title)
    )
    return list((await session.execute(stmt)).unique().scalars().all())


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
