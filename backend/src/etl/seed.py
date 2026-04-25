"""Seed Postgres with curated dev data.

Idempotent — re-running upserts existing rows by `wikidata_id`. Use `--reset`
to TRUNCATE the artwork/museum/artist tables first (also cascades into
wishlist_items via the existing FK ON DELETE CASCADE).

    cd backend/src && uv run python -m etl.seed
    cd backend/src && uv run python -m etl.seed --reset
"""

from __future__ import annotations

import argparse
import asyncio
import re
import unicodedata
from typing import Any

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from core.logging import configure_logging, get_logger
from db.session import SessionLocal
from etl.seed_data import ARTISTS, ARTWORKS, MUSEUMS
from models.artist import Artist
from models.artwork import Artwork, ArtworkKind
from models.museum import Museum

log = get_logger("etl.seed")


def _slugify(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    ascii_value = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value).strip("-").lower()
    return re.sub(r"-{2,}", "-", ascii_value)


async def _upsert(
    session: AsyncSession,
    model: type,
    rows: list[dict[str, Any]],
    *,
    conflict_col: str = "wikidata_id",
) -> None:
    if not rows:
        return
    stmt = pg_insert(model).values(rows)
    update_cols = {
        c.name: stmt.excluded[c.name]
        for c in model.__table__.columns
        if c.name not in ("id", "created_at", conflict_col)
    }
    update_cols["updated_at"] = func.now()
    await session.execute(
        stmt.on_conflict_do_update(index_elements=[conflict_col], set_=update_cols)
    )


def _artist_row(a: dict[str, Any]) -> dict[str, Any]:
    return {**a, "slug": _slugify(a["name"])}


def _museum_row(m: dict[str, Any]) -> dict[str, Any]:
    return dict(m)


def _artwork_row(
    a: dict[str, Any],
    artist_ids: dict[str, int],
    museum_ids: dict[str, int],
) -> dict[str, Any]:
    artist_id = artist_ids.get(a["artist_wikidata_id"])
    if artist_id is None:
        raise KeyError(
            f"Artwork {a['wikidata_id']} references unknown artist {a['artist_wikidata_id']}"
        )
    museum_id = museum_ids.get(a["museum_wikidata_id"]) if a["museum_wikidata_id"] else None
    return {
        "wikidata_id": a["wikidata_id"],
        "title": a["title"],
        "slug": _slugify(a["title"]),
        "artist_id": artist_id,
        "museum_id": museum_id,
        "year": a["year"],
        "kind": ArtworkKind(a["kind"]),
        "image_url": a["image_url"],
    }


async def seed(*, reset: bool = False) -> None:
    configure_logging()
    log.info("seed_started", reset=reset)

    async with SessionLocal() as session:
        if reset:
            await session.execute(
                text("TRUNCATE artworks, museums, artists RESTART IDENTITY CASCADE")
            )
            log.info("seed_reset")

        await _upsert(session, Artist, [_artist_row(dict(a)) for a in ARTISTS])
        await _upsert(session, Museum, [_museum_row(dict(m)) for m in MUSEUMS])

        artist_ids = dict((await session.execute(select(Artist.wikidata_id, Artist.id))).all())
        museum_ids = dict((await session.execute(select(Museum.wikidata_id, Museum.id))).all())

        artwork_rows = [_artwork_row(a, artist_ids, museum_ids) for a in ARTWORKS]
        await _upsert(session, Artwork, artwork_rows)

        await session.commit()

    log.info(
        "seed_finished",
        artists=len(ARTISTS),
        museums=len(MUSEUMS),
        artworks=len(ARTWORKS),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset",
        action="store_true",
        help="TRUNCATE artworks/museums/artists before seeding (cascades to wishlist_items).",
    )
    args = parser.parse_args()
    asyncio.run(seed(reset=args.reset))


if __name__ == "__main__":
    main()
