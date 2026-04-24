from fastapi import APIRouter, Query

from api.v1.deps import DbSession
from schemas.search import SearchResults
from services import search as search_service

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResults)
async def search(
    session: DbSession,
    q: str = Query(..., min_length=1, description="Free-text query."),
) -> SearchResults:
    return await search_service.search_artworks(session, query=q)
