from fastapi import APIRouter

from api.v1.deps import DbSession, PaginationParams
from repositories import museum as museum_repo
from schemas.common import Page
from schemas.museum import MuseumRead

router = APIRouter(prefix="/museums", tags=["museums"])


@router.get("", response_model=Page[MuseumRead])
async def list_museums(session: DbSession, pagination: PaginationParams) -> Page[MuseumRead]:
    items, total = await museum_repo.list_museums(
        session, limit=pagination.limit, offset=pagination.offset
    )
    return Page[MuseumRead](
        items=[MuseumRead.model_validate(m) for m in items],
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
    )
