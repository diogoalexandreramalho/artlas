from pydantic import BaseModel, ConfigDict

from models.artwork import ArtworkKind
from schemas.artist import ArtistRead
from schemas.museum import MuseumRead


class ArtworkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    wikidata_id: str
    title: str
    slug: str
    year: int | None = None
    kind: ArtworkKind
    image_url: str | None = None
    artist: ArtistRead
    museum: MuseumRead | None = None
