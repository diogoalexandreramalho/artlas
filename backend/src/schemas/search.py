from pydantic import BaseModel

from schemas.artist import ArtistRead
from schemas.artwork import ArtworkRead
from schemas.museum import MuseumRead


class SearchResults(BaseModel):
    """Mixed-bucket search response.

    Each bucket is independently ranked by pg_trgm similarity, capped at
    `limit_per_type`. A query that matches nothing in a bucket returns `[]`
    for that bucket, not an error.
    """

    query: str
    artists: list[ArtistRead]
    artworks: list[ArtworkRead]
    museums: list[MuseumRead]
