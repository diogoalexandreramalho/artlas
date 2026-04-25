"""trigram indexes for fuzzy search

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-25

Adds GIN trigram indexes on the three primary text columns hit by `/search`.
`pg_trgm` is already enabled in 0001.
"""
from collections.abc import Sequence

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_artists_name_trgm",
        "artists",
        ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )
    op.create_index(
        "ix_artworks_title_trgm",
        "artworks",
        ["title"],
        postgresql_using="gin",
        postgresql_ops={"title": "gin_trgm_ops"},
    )
    op.create_index(
        "ix_museums_name_trgm",
        "museums",
        ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_museums_name_trgm", table_name="museums")
    op.drop_index("ix_artworks_title_trgm", table_name="artworks")
    op.drop_index("ix_artists_name_trgm", table_name="artists")
