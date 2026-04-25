from fastapi import APIRouter

from api.v1.deps import DbSession, PaginationParams
from core.exceptions import NotFoundError
from repositories import museum as museum_repo
from schemas.artwork import ArtworkRead
from schemas.common import Page
from schemas.museum import MuseumRead
from schemas.museum_detail import MuseumDetail

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


@router.get("/{wikidata_id}", response_model=MuseumDetail)
async def get_museum(session: DbSession, wikidata_id: str) -> MuseumDetail:
    museum = await museum_repo.get_by_wikidata_id(session, wikidata_id)
    if museum is None:
        raise NotFoundError(f"Museum '{wikidata_id}' not found.")
    artworks = await museum_repo.list_artworks_by_museum(session, museum.id)
    return MuseumDetail.model_validate(
        {
            **museum.__dict__,
            "artworks": [ArtworkRead.model_validate(a) for a in artworks],
        }
    )
