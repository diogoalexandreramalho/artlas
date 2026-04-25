from fastapi import APIRouter

from api.v1.deps import DbSession, PaginationParams
from core.exceptions import NotFoundError
from repositories import artist as artist_repo
from schemas.artist import ArtistDetail, ArtistRead
from schemas.artwork import ArtworkRead
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


@router.get("/{slug}", response_model=ArtistDetail)
async def get_artist(session: DbSession, slug: str) -> ArtistDetail:
    artist = await artist_repo.get_by_slug(session, slug)
    if artist is None:
        raise NotFoundError(f"Artist '{slug}' not found.")
    artworks = await artist_repo.list_artworks_by_artist(session, artist.id)
    return ArtistDetail.model_validate(
        {
            **artist.__dict__,
            "artworks": [ArtworkRead.model_validate(a) for a in artworks],
        }
    )
