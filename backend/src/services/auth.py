from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import ConflictError, UnauthorizedError
from core.security import (
    DUMMY_PASSWORD_HASH,
    hash_password,
    verify_password,
)
from models.user import User
from repositories import user as user_repo


async def register_user(session: AsyncSession, *, email: str, password: str) -> User:
    existing = await user_repo.get_by_email(session, email)
    if existing is not None:
        raise ConflictError("A user with this email already exists.")
    user = await user_repo.create(
        session, email=email, password_hash=hash_password(password)
    )
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, *, email: str, password: str) -> User:
    user = await user_repo.get_by_email(session, email)
    if user is None:
        # Keep timing roughly constant — see DUMMY_PASSWORD_HASH in core/security.py.
        verify_password(password, DUMMY_PASSWORD_HASH)
        raise UnauthorizedError("Incorrect email or password.")
    if not verify_password(password, user.password_hash):
        raise UnauthorizedError("Incorrect email or password.")
    return user
