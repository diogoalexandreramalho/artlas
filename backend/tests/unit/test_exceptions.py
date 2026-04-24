import json

import pytest
from fastapi import Request

from core.exceptions import (
    AppException,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationAppError,
    _app_exception_handler,
)


def _make_request() -> Request:
    scope = {"type": "http", "method": "GET", "path": "/", "headers": []}
    return Request(scope)  # type: ignore[arg-type]


def test_subclass_status_and_code_values() -> None:
    assert (NotFoundError.status_code, NotFoundError.code) == (404, "not_found")
    assert (UnauthorizedError.status_code, UnauthorizedError.code) == (401, "unauthorized")
    assert (ForbiddenError.status_code, ForbiddenError.code) == (403, "forbidden")
    assert (ConflictError.status_code, ConflictError.code) == (409, "conflict")
    assert (ValidationAppError.status_code, ValidationAppError.code) == (422, "validation_error")
    assert (AppException.status_code, AppException.code) == (500, "internal_error")


def test_custom_message_overrides_default() -> None:
    exc = NotFoundError("artwork 42 missing", details={"id": 42})
    assert exc.message == "artwork 42 missing"
    assert exc.details == {"id": 42}


def test_default_message_used_when_none_provided() -> None:
    exc = NotFoundError()
    assert exc.message == NotFoundError.message
    assert exc.details is None


@pytest.mark.parametrize(
    ("exc_cls", "expected_status", "expected_code"),
    [
        (NotFoundError, 404, "not_found"),
        (ForbiddenError, 403, "forbidden"),
        (ConflictError, 409, "conflict"),
        (ValidationAppError, 422, "validation_error"),
    ],
)
async def test_handler_returns_expected_shape(
    exc_cls: type[AppException], expected_status: int, expected_code: str
) -> None:
    response = await _app_exception_handler(_make_request(), exc_cls("boom", details={"k": "v"}))
    assert response.status_code == expected_status
    body = json.loads(response.body)
    assert body == {"code": expected_code, "message": "boom", "details": {"k": "v"}}
    assert "www-authenticate" not in {k.lower() for k in response.headers}


async def test_handler_sets_www_authenticate_on_unauthorized() -> None:
    response = await _app_exception_handler(_make_request(), UnauthorizedError("nope"))
    assert response.status_code == 401
    body = json.loads(response.body)
    assert body == {"code": "unauthorized", "message": "nope", "details": None}
    assert response.headers.get("www-authenticate") == "Bearer"
