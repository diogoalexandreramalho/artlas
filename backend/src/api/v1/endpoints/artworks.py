from fastapi import APIRouter

from api.v1.deps import DbSession, PaginationParams
from repositories import artwork as artwork_repo
from schemas.artwork import ArtworkRead
from schemas.common import Page

router = APIRouter(prefix="/artworks", tags=["artworks"])


@router.get("", response_model=Page[ArtworkRead])
async def list_artworks(session: DbSession, pagination: PaginationParams) -> Page[ArtworkRead]:
    items, total = await artwork_repo.list_artworks(
        session, limit=pagination.limit, offset=pagination.offset
    )
    return Page[ArtworkRead](
        items=[ArtworkRead.model_validate(a) for a in items],
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
    )
