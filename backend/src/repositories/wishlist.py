import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.wishlist import WishlistItem


async def list_for_user(session: AsyncSession, user_id: uuid.UUID) -> list[WishlistItem]:
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.user_id == user_id)
        .order_by(WishlistItem.created_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def add(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    artwork_id: int,
    notes: str | None,
) -> WishlistItem:
    item = WishlistItem(user_id=user_id, artwork_id=artwork_id, notes=notes)
    session.add(item)
    await session.flush()
    return item


async def remove(session: AsyncSession, *, user_id: uuid.UUID, artwork_id: int) -> int:
    stmt = delete(WishlistItem).where(
        WishlistItem.user_id == user_id, WishlistItem.artwork_id == artwork_id
    )
    result = await session.execute(stmt)
    return result.rowcount or 0
