from fastapi import APIRouter, Query

from api.v1.deps import DbSession
from schemas.search import SearchResults
from services import search as search_service

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResults)
async def search(
    session: DbSession,
    q: str = Query(..., min_length=1, description="Free-text query."),
    limit_per_type: int = Query(
        5, ge=1, le=20, description="Max results per bucket (artists/artworks/museums)."
    ),
) -> SearchResults:
    return await search_service.search_all(session, query=q, limit_per_type=limit_per_type)
