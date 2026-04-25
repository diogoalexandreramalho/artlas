from fastapi import APIRouter

from api.v1.deps import DbSession, PaginationParams
from repositories import artist as artist_repo
from schemas.artist import ArtistRead
from schemas.common import Page

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("", response_model=Page[ArtistRead])
async def list_artists(session: DbSession, pagination: PaginationParams) -> Page[ArtistRead]:
    items, total = await artist_repo.list_artists(
        session, limit=pagination.limit, offset=pagination.offset
    )
    return Page[ArtistRead](
        items=[ArtistRead.model_validate(a) for a in items],
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
    )
