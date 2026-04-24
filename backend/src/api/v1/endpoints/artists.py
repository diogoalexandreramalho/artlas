from fastapi import APIRouter

from schemas.artist import ArtistRead

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("", response_model=list[ArtistRead])
async def list_artists() -> list[ArtistRead]:
    # TODO: implement once ETL has populated artists.
    return []
