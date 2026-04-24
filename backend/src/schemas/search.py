from pydantic import BaseModel

from schemas.artwork import ArtworkRead


class SearchResults(BaseModel):
    query: str
    total: int
    results: list[ArtworkRead]
