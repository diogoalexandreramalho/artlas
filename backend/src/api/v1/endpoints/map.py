from fastapi import APIRouter, Query

from api.v1.deps import DbSession
from core.exceptions import ValidationAppError
from models.artwork import Artwork
from models.museum import Museum
from repositories import map as map_repo
from schemas.map import MapArtwork, MapFilters, MapMuseumResult, MapResponse

router = APIRouter(prefix="/map", tags=["map"])


def _parse_bbox(raw: str) -> tuple[float, float, float, float]:
    """`"minLng,minLat,maxLng,maxLat"` → 4 floats, validated."""
    parts = raw.split(",")
    if len(parts) != 4:
        raise ValidationAppError("bbox must be 'minLng,minLat,maxLng,maxLat'.")
    try:
        min_lng, min_lat, max_lng, max_lat = (float(p) for p in parts)
    except ValueError as exc:
        raise ValidationAppError("bbox values must be numeric.") from exc
    if not (-180 <= min_lng <= 180 and -180 <= max_lng <= 180):
        raise ValidationAppError("bbox longitudes must be within [-180, 180].")
    if not (-90 <= min_lat <= 90 and -90 <= max_lat <= 90):
        raise ValidationAppError("bbox latitudes must be within [-90, 90].")
    if min_lng > max_lng or min_lat > max_lat:
        raise ValidationAppError("bbox min must be ≤ max for both axes.")
    return min_lng, min_lat, max_lng, max_lat


def _to_result(museum: Museum, artworks: list[Artwork]) -> MapMuseumResult:
    return MapMuseumResult.model_validate(
        {
            **museum.__dict__,
            "artworks": [
                MapArtwork(
                    id=a.id,
                    slug=a.slug,
                    title=a.title,
                    year=a.year,
                    image_url=a.image_url,
                    artist_name=a.artist.name,
                    artist_slug=a.artist.slug,
                )
                for a in artworks
            ],
        }
    )


@router.get("/artworks", response_model=MapResponse)
async def map_artworks(
    session: DbSession,
    bbox: str = Query(
        ...,
        description="Comma-separated 'minLng,minLat,maxLng,maxLat'.",
        examples=["-180,-90,180,90"],
    ),
    q: str | None = Query(None, description="Free-text query (artwork title or artist name)."),
    city: str | None = Query(None, description="Museum city (case-insensitive equality)."),
    country: str | None = Query(None, description="Museum country (case-insensitive equality)."),
    movement: str | None = Query(None, description="Artist movement (case-insensitive equality)."),
) -> MapResponse:
    parsed = _parse_bbox(bbox)
    pairs = await map_repo.list_artworks_in_bbox(
        session, bbox=parsed, q=q, city=city, country=country, movement=movement
    )
    return MapResponse(museums=[_to_result(m, aw) for m, aw in pairs])


@router.get("/filters", response_model=MapFilters)
async def map_filters(session: DbSession) -> MapFilters:
    return MapFilters(**await map_repo.list_filter_options(session))
