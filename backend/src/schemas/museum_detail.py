"""Detail-page response shape for `GET /museums/{wikidata_id}`.

Lives in its own file because `MuseumRead` and `ArtworkRead` reference each
other (artworks have a museum, museums have artworks). Defining `MuseumDetail`
inside `schemas/museum.py` would create a circular import via `schemas/artwork`.
This file is only loaded by the endpoint, after both base schemas are resolved.
"""

from schemas.artwork import ArtworkRead
from schemas.museum import MuseumRead


class MuseumDetail(MuseumRead):
    """MuseumRead + the artworks held by the museum."""

    artworks: list[ArtworkRead]
