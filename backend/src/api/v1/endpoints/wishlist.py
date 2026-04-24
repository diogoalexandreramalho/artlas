from fastapi import APIRouter, status

from api.v1.deps import CurrentUser, DbSession
from core.exceptions import NotFoundError
from repositories import wishlist as wishlist_repo
from schemas.wishlist import WishlistItemCreate, WishlistItemRead

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemRead])
async def list_wishlist(
    session: DbSession, current_user: CurrentUser
) -> list[WishlistItemRead]:
    items = await wishlist_repo.list_for_user(session, current_user.id)
    return [WishlistItemRead.model_validate(i) for i in items]


@router.post("", response_model=WishlistItemRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    payload: WishlistItemCreate, session: DbSession, current_user: CurrentUser
) -> WishlistItemRead:
    item = await wishlist_repo.add(
        session,
        user_id=current_user.id,
        artwork_id=payload.artwork_id,
        notes=payload.notes,
    )
    await session.commit()
    await session.refresh(item)
    return WishlistItemRead.model_validate(item)


@router.delete("/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    artwork_id: int, session: DbSession, current_user: CurrentUser
) -> None:
    removed = await wishlist_repo.remove(
        session, user_id=current_user.id, artwork_id=artwork_id
    )
    if not removed:
        raise NotFoundError("Wishlist item not found.")
    await session.commit()
