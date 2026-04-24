"""Wikidata SPARQL ETL — stub.

Daily cron entrypoint: `uv run python -m etl.wikidata`.

TODO (follow-up session):
    - Pagination over SPARQL results.
    - Upsert logic for artists, museums, artworks.
    - Slug generation and de-duplication by wikidata_id.
    - Structured logging of rows in/updated/skipped.
"""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from core.logging import configure_logging, get_logger

SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"
USER_AGENT = "Artlas/0.1 (https://github.com/<your-handle>/artlas; contact@example.com)"

# Example query (do not run as-is without LIMIT — Wikidata will rate-limit):
#   Artworks with a creator and a holding museum that has coordinates.
EXAMPLE_ARTWORKS_QUERY = """
SELECT ?artwork ?artworkLabel ?creator ?creatorLabel ?museum ?museumLabel ?coord WHERE {
  ?artwork wdt:P31/wdt:P279* wd:Q838948 .            # instance of work of art
  ?artwork wdt:P170 ?creator .                        # creator
  ?artwork wdt:P276 ?museum .                         # location
  ?museum wdt:P625 ?coord .                           # coordinate location
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 100
"""


class SparqlClient:
    def __init__(self, endpoint: str = SPARQL_ENDPOINT) -> None:
        self._endpoint = endpoint
        self._client = httpx.AsyncClient(
            headers={"Accept": "application/sparql-results+json", "User-Agent": USER_AGENT},
            timeout=httpx.Timeout(60.0),
        )

    async def query(self, sparql: str) -> list[dict[str, Any]]:
        response = await self._client.get(self._endpoint, params={"query": sparql})
        response.raise_for_status()
        return response.json()["results"]["bindings"]

    async def aclose(self) -> None:
        await self._client.aclose()


async def sync() -> None:
    configure_logging()
    log = get_logger("etl.wikidata")
    log.info("wikidata_sync_started")
    # TODO: real sync. For now we just log and exit.
    log.info("wikidata_sync_finished", rows_upserted=0)


if __name__ == "__main__":
    asyncio.run(sync())
