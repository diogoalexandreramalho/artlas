# Artlas

Search artists, artworks, cities, or movements and see where works live on a map. Save artworks to a wishlist to plan trips.

## Stack

- **Backend**: FastAPI, async SQLAlchemy 2, Alembic, Postgres 16 + PostGIS + pg_trgm, JWT auth (PyJWT + argon2 via pwdlib), `uv`.
- **Frontend**: React 18 + TS + Vite, React Router, TanStack Query, MapLibre GL (OSM tiles), Tailwind.
- **Data**: Wikidata SPARQL → nightly ETL into Postgres.

## Quickstart (native dev, recommended)

```bash
# Postgres only in Docker
docker compose up -d postgres

# Backend
cd backend
cp .env.example .env
# Generate a secret: openssl rand -hex 32  →  paste into JWT_SECRET_KEY
uv sync
uv run alembic upgrade head
(cd src && uv run python -m etl.seed)   # seed dev data (idempotent; --reset to truncate)
uv run uvicorn main:app --reload --app-dir src
# http://localhost:8000/docs

# Frontend (in another terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

## Full Docker

```bash
docker compose up --build
```

Starts postgres + backend + frontend.

## Project layout

```
artlas/
├── backend/       # FastAPI app, Alembic migrations, ETL
├── frontend/      # Vite React app
├── docker-compose.yml
└── .claude/skills/artlas/SKILL.md   # conventions + how-to for contributors
```

See [SKILL.md](.claude/skills/artlas/SKILL.md) for conventions, common tasks, and the architectural rationale behind the stack choices.
