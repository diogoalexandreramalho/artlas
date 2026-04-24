from pydantic import BaseModel, ConfigDict, Field

from schemas.artwork import ArtworkRead


class WishlistItemCreate(BaseModel):
    artwork_id: int
    notes: str | None = Field(default=None, max_length=1000)


class WishlistItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    artwork: ArtworkRead
    notes: str | None = None
