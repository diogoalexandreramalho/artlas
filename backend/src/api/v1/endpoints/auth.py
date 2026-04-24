from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from api.v1.deps import CurrentUser, DbSession
from core.security import create_access_token
from schemas.auth import RegisterRequest, TokenResponse
from schemas.user import UserRead
from services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: DbSession) -> UserRead:
    user = await auth_service.register_user(
        session, email=payload.email, password=payload.password
    )
    return UserRead.model_validate(user)


@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: DbSession,
) -> TokenResponse:
    user = await auth_service.authenticate_user(
        session, email=form_data.username, password=form_data.password
    )
    access_token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
