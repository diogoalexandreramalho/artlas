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
