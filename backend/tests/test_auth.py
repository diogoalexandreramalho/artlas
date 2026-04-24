"""Auth happy-path integration test.

Requires a running Postgres reachable via the test env. For CI we'll swap in a
dedicated test DB fixture in a follow-up. For now this exercises the route
wiring; run against `docker compose up -d postgres` + `alembic upgrade head`.
"""
from httpx import AsyncClient


async def test_register_login_me(client: AsyncClient) -> None:
    email = "test-user@example.com"
    password = "supersecret"

    r = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    assert r.status_code in (201, 409)  # 409 if re-run

    r = await client.post(
        "/api/v1/auth/token",
        data={"username": email, "password": password},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    r = await client.get(
        "/api/v1/auth/me", headers={"authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert r.json()["email"] == email
