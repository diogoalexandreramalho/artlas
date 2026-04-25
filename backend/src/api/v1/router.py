from fastapi import APIRouter

from api.v1.endpoints import artists, artworks, auth, map, museums, search, wishlist

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(search.router)
api_router.include_router(artists.router)
api_router.include_router(artworks.router)
api_router.include_router(museums.router)
api_router.include_router(map.router)
api_router.include_router(wishlist.router)
