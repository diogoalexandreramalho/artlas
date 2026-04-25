import uuid
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import UnauthorizedError
from core.security import decode_token
from db.session import get_session
from models.user import User
from repositories import user as user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

DbSession = Annotated[AsyncSession, Depends(get_session)]


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def _pagination(
    limit: int = Query(20, ge=1, le=100, description="Max items to return."),
    offset: int = Query(0, ge=0, description="Items to skip."),
) -> Pagination:
    return Pagination(limit=limit, offset=offset)


PaginationParams = Annotated[Pagination, Depends(_pagination)]


async def get_current_user(
    session: DbSession,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if sub is None:
            raise UnauthorizedError("Could not validate credentials.")
        user_id = uuid.UUID(sub)
    except (InvalidTokenError, ValueError) as exc:
        raise UnauthorizedError("Could not validate credentials.") from exc

    user = await user_repo.get_by_id(session, user_id)
    if user is None:
        raise UnauthorizedError("Could not validate credentials.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
