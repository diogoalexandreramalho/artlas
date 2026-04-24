from datetime import timedelta

import jwt
import pytest

from core.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_is_not_plaintext() -> None:
    hashed = hash_password("s3cret!")
    assert hashed != "s3cret!"
    assert isinstance(hashed, str)
    assert len(hashed) > 0


def test_verify_password_accepts_correct_password() -> None:
    hashed = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", hashed) is True


def test_verify_password_rejects_wrong_password() -> None:
    hashed = hash_password("correct horse battery staple")
    assert verify_password("wrong password", hashed) is False


def test_access_token_roundtrip_preserves_subject() -> None:
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert "exp" in payload


def test_access_token_respects_custom_expiry() -> None:
    token = create_access_token("user-123", expires_delta=timedelta(seconds=1))
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert "exp" in payload


def test_access_token_includes_extra_claims() -> None:
    token = create_access_token("user-123", extra_claims={"role": "admin"})
    payload = decode_token(token)
    assert payload["role"] == "admin"


def test_decode_token_rejects_garbage() -> None:
    with pytest.raises(jwt.InvalidTokenError):
        decode_token("not-a-real-token")


def test_dummy_password_hash_does_not_match_real_passwords() -> None:
    assert verify_password("dummy-password-for-timing", DUMMY_PASSWORD_HASH) is True
    assert verify_password("anything-else", DUMMY_PASSWORD_HASH) is False
