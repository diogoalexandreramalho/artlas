from pydantic import BaseModel, ConfigDict


class ArtistRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    wikidata_id: str
    name: str
    slug: str
    birth_year: int | None = None
    death_year: int | None = None
    nationality: str | None = None
    movement: str | None = None


class ArtistDetail(ArtistRead):
    """ArtistRead + the artworks the artist made."""

    # Imported lazily to avoid a circular import between artist.py and artwork.py
    # (artwork.py already imports ArtistRead from this module).
    artworks: "list[ArtworkRead]"


# Resolve the forward reference at module load.
from schemas.artwork import ArtworkRead  # noqa: E402

ArtistDetail.model_rebuild()
