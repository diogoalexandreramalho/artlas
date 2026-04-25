from pydantic import BaseModel


class Page[T](BaseModel):
    """Generic offset/limit pagination envelope."""

    items: list[T]
    total: int
    limit: int
    offset: int
