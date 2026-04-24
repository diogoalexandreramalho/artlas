from fastapi import APIRouter

from schemas.artwork import ArtworkRead

router = APIRouter(prefix="/artworks", tags=["artworks"])


@router.get("", response_model=list[ArtworkRead])
async def list_artworks() -> list[ArtworkRead]:
    # TODO: implement once ETL has populated artworks.
    return []
