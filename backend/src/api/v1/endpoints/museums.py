from fastapi import APIRouter

from schemas.museum import MuseumRead

router = APIRouter(prefix="/museums", tags=["museums"])


@router.get("", response_model=list[MuseumRead])
async def list_museums() -> list[MuseumRead]:
    # TODO: implement once ETL has populated museums.
    return []
