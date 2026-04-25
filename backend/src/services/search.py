from sqlalchemy.ext.asyncio import AsyncSession

from repositories import artist as artist_repo
from repositories import artwork as artwork_repo
from repositories import museum as museum_repo
from schemas.artist import ArtistRead
from schemas.artwork import ArtworkRead
from schemas.museum import MuseumRead
from schemas.search import SearchResults


async def search_all(
    session: AsyncSession, *, query: str, limit_per_type: int
) -> SearchResults:
    """Mixed-bucket trigram search.

    Each bucket runs an independent pg_trgm `%` query with a `similarity(...)`
    ORDER BY. The default similarity threshold (0.3) handles minor typos
    ("picaso" → Picasso) without surfacing noise.
    """
    artists = await artist_repo.search_artists(session, q=query, limit=limit_per_type)
    artworks = await artwork_repo.search_artworks(session, q=query, limit=limit_per_type)
    museums = await museum_repo.search_museums(session, q=query, limit=limit_per_type)

    return SearchResults(
        query=query,
        artists=[ArtistRead.model_validate(a) for a in artists],
        artworks=[ArtworkRead.model_validate(a) for a in artworks],
        museums=[MuseumRead.model_validate(m) for m in museums],
    )
