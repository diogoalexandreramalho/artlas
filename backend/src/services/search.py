from sqlalchemy.ext.asyncio import AsyncSession

from models.artwork import Artwork
from schemas.search import SearchResults


async def search_artworks(session: AsyncSession, *, query: str) -> SearchResults:
    # TODO: implement real search once ETL has populated the DB.
    # Plan: pg_trgm similarity on artwork.title + artist.name, ranked.
    _ = session, Artwork
    return SearchResults(query=query, total=0, results=[])
