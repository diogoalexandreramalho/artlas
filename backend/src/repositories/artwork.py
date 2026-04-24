from sqlalchemy.ext.asyncio import AsyncSession

from models.artwork import Artwork


async def get_by_id(session: AsyncSession, artwork_id: int) -> Artwork | None:
    return await session.get(Artwork, artwork_id)
