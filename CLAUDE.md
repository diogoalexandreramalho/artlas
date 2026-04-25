# Artlas

Search artists/artworks on a map. Data from Wikidata (daily ETL → Postgres).

## Stack

- **Backend**: FastAPI, async SQLAlchemy 2, Alembic, Postgres 16 + PostGIS + pg_trgm. `uv`, `ruff`.
- **Auth**: OAuth2 password flow, PyJWT (HS256, access-only ~60 min), pwdlib + argon2id.
- **Frontend**: React + TS + Vite, React Router, TanStack Query, MapLibre GL + OSM tiles, Tailwind.

## Layout

```
backend/src/
  main.py              # app factory
  api/v1/              # router.py, deps.py (CurrentUser, DbSession), endpoints/
  core/                # config, security, exceptions, logging
  db/                  # base (DeclarativeBase + TimestampMixin), session
  models/              # SQLAlchemy
  schemas/             # Pydantic
  services/            # business rules, commits here
  repositories/        # async DB access
  etl/                 # wikidata.py (stub), seed.py + seed_data.py (dev fixtures)
backend/alembic/       # migrations
frontend/src/
  app/                 # App, providers, routes
  features/<name>/     # pages, hooks, types per feature
  lib/                 # api.ts (request wrapper, token), queryClient
```

Backend imports are absolute from `src/`: `from core.config import ...` — `src/` is on `sys.path` via pytest `pythonpath` and uvicorn `--app-dir`.

## Commands

```bash
# Postgres only
docker compose up -d postgres

# Backend
cd backend && uv sync
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "..."
PYTHONPATH=src uv run python -m etl.seed              # seed dev data (idempotent; --reset to truncate)
uv run uvicorn main:app --reload --app-dir src
uv run pytest
uv run ruff check .

# Frontend
cd frontend && npm install
npm run dev
npm run typecheck
npm run test

# Full stack
docker compose up --build
```

## Conventions

- **Errors**: raise `AppException` subclasses from `core/exceptions.py`. Don't return ad-hoc error JSON — the handler formats it.
- **Auth**: protect routes with `CurrentUser` dep from `api/v1/deps.py`. Login uses `DUMMY_PASSWORD_HASH` to keep timing constant on unknown emails.
- **Layering**: endpoint → service → repository → model. Services commit; repositories don't.
- **Frontend API**: always `request()` from `lib/api.ts` (attaches bearer, surfaces `ApiError`). Never raw `fetch`.
- **Query keys**: `['resource', ...inputs]`.

## Adding an endpoint

model → schema → repository → service → router → register in `api/v1/router.py` → alembic revision → test.

## Git workflow

- **Branches**: short-lived feature branches off `main`. Name: `<type>/<slug>` — e.g. `feat/wikidata-etl`, `fix/cors-parsing`.
- **Commits**: small and focused. Format: `<type>(<scope>): <imperative summary>` — e.g. `feat(auth): add password reset`, `fix(etl): handle empty wikidata response`. Scope is optional — omit the parentheses when the change spans many areas (`chore: bump pre-commit ruff version`).
- **Types**: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`. **Common scopes**: `auth`, `etl`, `api`, `db`, `frontend`, `tests`, `ci`, `deps`.
- **PRs**: open against `main`, squash-merge. Title matches commit format (`<type>(<scope>): <imperative>`, ≤ 70 chars).
- **PR body**:
  ```
  ## Summary
  - what changed and why (1-3 bullets)

  ## Test plan
  - [ ] how it was verified

  ## Notes
  - follow-ups / gaps (omit if none)
  ```
- **Pre-commit**: `pre-commit install` once per clone. Runs ruff, backend unit tests, frontend typecheck on staged files. Install with `uv tool install pre-commit` or `pipx install pre-commit`.
- **No direct pushes to `main`**. Open a PR even for one-line fixes — the diff is the record.
- **Skill**: invoke `/open-pr` to commit (if needed), push, and open a PR following the conventions above.

## Tests

- Unit tests for pure functions live in `backend/tests/unit/`. Run with `cd backend && uv run pytest tests/unit`.
- Integration tests + frontend tests will land in a follow-up; `tests/test_auth.py` is a known-broken placeholder for now.

## Not yet built

- Wikidata ETL upsert (stub only).
- Real search (endpoint returns empty).
- Artwork / artist / museum detail routes.
- CI.

Update this file when a non-obvious convention or gotcha is introduced.
