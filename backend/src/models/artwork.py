import enum

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin
from models.artist import Artist
from models.museum import Museum


class ArtworkKind(str, enum.Enum):
    painting = "painting"
    sculpture = "sculpture"
    other = "other"


class Artwork(Base, TimestampMixin):
    __tablename__ = "artworks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wikidata_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    artist_id: Mapped[int] = mapped_column(ForeignKey("artists.id"), nullable=False, index=True)
    museum_id: Mapped[int | None] = mapped_column(
        ForeignKey("museums.id"), nullable=True, index=True
    )
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    kind: Mapped[ArtworkKind] = mapped_column(
        Enum(ArtworkKind, name="artwork_kind"), nullable=False, default=ArtworkKind.other
    )
    image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    artist: Mapped[Artist] = relationship(lazy="joined")
    museum: Mapped[Museum | None] = relationship(lazy="joined")
