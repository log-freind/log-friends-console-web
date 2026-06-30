# log-friends-console-web

Standalone Next.js frontend for Log Friends Console.

`log-friends-console` remains the backend API. This repository owns the browser UI: app selection, event exploration, Raw Events filtering, and CSV download.

```text
log-friends-sdk
  -> log-friends-console backend API
  -> log-friends-console-web
```

## Requirements

- Node.js 25+
- npm 11+
- Running `log-friends-console` on port `8080`

## Routes

| Route | Purpose |
|---|---|
| `/` | overview, Console API health, app count, migration targets |
| `/log-catalog` | app/worker filtering, event list, event detail, LogSpec hints, samples, mismatches |
| `/raw-events` | raw `LOG_EVENT` query, app/worker/eventName/time range/limit filters, CSV download |

## Backend API Dependency

The web app does not access PostgreSQL/TimescaleDB directly. It depends on Console API contracts.

Required backend endpoints:

```text
GET /api/log-catalog/apps
GET /api/log-catalog/apps/{appName}/events
GET /api/events/custom
GET /api/events/custom.csv
```

The backend remains responsible for ingest, agent registration, storage, scheduling, Log Catalog assembly, and API contracts.

## Environment

Create `.env.local` when the backend is not on the default URL:

```bash
NEXT_PUBLIC_CONSOLE_API_BASE_URL=http://localhost:8080
```

The default is `http://localhost:8080`. A trailing slash is removed in the runtime config.

## Local Development

Install and run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

VS Code can also run `Next.js: dev` from `Tasks: Run Task`.

## Build And Check

```bash
npm run lint
npm run build
npm run start
```

## Frontend Architecture

- **Next.js**: application routes and rendering
- **TanStack Query**: server state from Console APIs
- **Zustand**: shared UI selection/filter state
- **API adapter**: Console backend calls are grouped under `src/lib/api`
- **Feature components**: route-specific UI lives under `src/features`
- **Shared UI components**: reusable primitives live under `src/components`

The important boundary is the API contract. Console Web should not know backend repositories, Kotlin services, Flyway tables, or TimescaleDB details.

## Current Scope

Implemented:

- Overview page
- Log Catalog page
- Event list and detail split
- Client-side event paging
- Raw Events page
- CSV download link generation
- Console API health check

Planned or backend-only in this phase:

- Field Request creation flow
- Server-side catalog paging
- OpenAPI-based generated TypeScript types
- Authentication and authorization
- Production deployment pipeline

## Local Full Flow

Run these services together:

```text
log-friends-console      -> http://localhost:8080
log-friends-examples     -> http://localhost:8081
log-friends-console-web  -> http://localhost:3000
```

Then use the example shop to generate events and check them in:

```text
http://localhost:3000/log-catalog
http://localhost:3000/raw-events
```
