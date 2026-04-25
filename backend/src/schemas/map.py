from pydantic import BaseModel, ConfigDict

from schemas.museum import MuseumRead


class MapArtwork(BaseModel):
    """Slim artwork shape for map popovers.

    Flatter than `ArtworkRead` (no nested artist/museum) — markers don't need
    the full graph, and a smaller payload renders faster on the map.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    year: int | None = None
    image_url: str | None = None
    artist_name: str
    artist_slug: str


class MapMuseumResult(MuseumRead):
    """A museum within the requested bbox, with the artworks it holds."""

    artworks: list[MapArtwork]


class MapResponse(BaseModel):
    museums: list[MapMuseumResult]


class MapFilters(BaseModel):
    """Distinct values to populate the map's filter dropdowns."""

    cities: list[str]
    countries: list[str]
    movements: list[str]
