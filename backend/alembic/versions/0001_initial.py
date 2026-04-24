"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-24

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "email",
            postgresql.CITEXT(),
            nullable=False,
            unique=True,
            index=True,
        ),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "artists",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("wikidata_id", sa.String(32), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("slug", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("birth_year", sa.Integer, nullable=True),
        sa.Column("death_year", sa.Integer, nullable=True),
        sa.Column("nationality", sa.String(100), nullable=True),
        sa.Column("movement", sa.String(100), nullable=True, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "museums",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("wikidata_id", sa.String(32), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("city", sa.String(120), nullable=True, index=True),
        sa.Column("country", sa.String(120), nullable=True, index=True),
        sa.Column("latitude", sa.Float, nullable=True),
        sa.Column("longitude", sa.Float, nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    artwork_kind = postgresql.ENUM(
        "painting", "sculpture", "other", name="artwork_kind", create_type=False
    )
    artwork_kind.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "artworks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("wikidata_id", sa.String(32), nullable=False, unique=True, index=True),
        sa.Column("title", sa.String(500), nullable=False, index=True),
        sa.Column("slug", sa.String(500), nullable=False, unique=True, index=True),
        sa.Column(
            "artist_id",
            sa.Integer,
            sa.ForeignKey("artists.id"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "museum_id",
            sa.Integer,
            sa.ForeignKey("museums.id"),
            nullable=True,
            index=True,
        ),
        sa.Column("year", sa.Integer, nullable=True),
        sa.Column(
            "kind",
            artwork_kind,
            nullable=False,
            server_default="other",
        ),
        sa.Column("image_url", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "artwork_id",
            sa.Integer,
            sa.ForeignKey("artworks.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("notes", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "artwork_id", name="uq_wishlist_user_artwork"),
    )


def downgrade() -> None:
    op.drop_table("wishlist_items")
    op.drop_table("artworks")
    op.execute("DROP TYPE IF EXISTS artwork_kind")
    op.drop_table("museums")
    op.drop_table("artists")
    op.drop_table("users")
