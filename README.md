# log-friends-console-web

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Console Web CI/CD](https://github.com/log-freind/log-friends-console-web/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/log-freind/log-friends-console-web/actions/workflows/ci-cd.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

Standalone web console for reviewing the structured events collected by Log Friends.

The first screen compares traffic, latency, captured event activity, and failure signals for the same time range. Log Catalog then connects an event to its API, field descriptions, real payload shape, and mismatches. Raw Events keeps the unmodified records available for filtering and CSV export.

```text
Spring Boot service
  -> log-friends-sdk
  -> log-friends-console API
  -> log-friends-console-web
```

This browser app never accesses PostgreSQL/TimescaleDB directly.

## Requirements

- Node.js 25+
- npm 11+
- Running `log-friends-console` on port `8080`

## Routes

| Route | Purpose |
|---|---|
| `/` | traffic, performance, event activity, and reliability overview |
| `/log-catalog` | app/worker filtering, event list, event detail, LogSpec hints, fields, mismatches |
| `/raw-events` | raw `LOG_EVENT` query, app/worker/eventName/time range/limit filters, CSV download |

## Backend API Dependency

The web app does not access PostgreSQL/TimescaleDB directly. It depends on Console API contracts.

Required backend endpoints:

```text
GET /api/log-catalog/apps
GET /api/log-catalog/apps/{appName}/events
GET /api/events/custom
GET /api/events/custom.csv
GET /api/overview/traffic
GET /api/overview/performance
GET /api/overview/business
GET /api/overview/reliability
```

The backend remains responsible for ingest, agent registration, storage, scheduling, Log Catalog assembly, and API contracts.

## Environment

For direct local access to a backend on port `8080`:

```bash
NEXT_PUBLIC_CONSOLE_API_BASE_URL=http://localhost:8080
```

For same-origin ingress or a local Next.js proxy, start from `.env.example`:

```bash
NEXT_PUBLIC_CONSOLE_API_BASE_URL=/console-api
CONSOLE_API_PROXY_TARGET=http://localhost:8080
```

The container also writes `CONSOLE_API_BASE_URL` into `public/runtime-config.js` at startup. This keeps one image reusable when the external host changes.

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

- Overview filters and Traffic, Performance, Event Activity, Reliability panels
- Log Catalog page
- Event list and detail split
- Client-side event paging
- LogSpec hints, field descriptions, recent payload comparison, and mismatch state
- Raw Events page
- CSV download link generation
- Console API health check

Planned or backend-only in this phase:

- Field Request creation flow
- Server-side catalog paging
- OpenAPI-based generated TypeScript types
- Authentication and authorization

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

## Deployment

Pull requests run lint and production build checks. Pushes to `main` additionally build an `linux/amd64` image on the NAS self-hosted runner, push commit and `latest` tags to GHCR, update the MicroK8s Deployment, and verify the ingress root.
