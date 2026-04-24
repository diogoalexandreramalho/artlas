from pydantic import BaseModel, ConfigDict


class MuseumRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    wikidata_id: str
    name: str
    city: str | None = None
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    website: str | None = None
