import uuid

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin
from models.artwork import Artwork


class WishlistItem(Base, TimestampMixin):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_id", "artwork_id", name="uq_wishlist_user_artwork"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    artwork_id: Mapped[int] = mapped_column(
        ForeignKey("artworks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # Eager-loaded so `WishlistItemRead.model_validate(item)` resolves the joined
    # artwork via `from_attributes=True`. Without this, GET /wishlist 500s on
    # Pydantic validation.
    artwork: Mapped[Artwork] = relationship(lazy="joined")
