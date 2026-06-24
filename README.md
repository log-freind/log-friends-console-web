# log-friends-console-web

Standalone Next.js web console for Log Friends.

The first phase keeps `log-friends-console` as the backend API and built-in
fallback UI. This repository grows the independent frontend one workflow at a
time.

```text
log-friends-sdk
-> log-friends-console API
-> log-friends-console-web
```

## Requirements

- Node.js 25+
- npm 11+
- Running `log-friends-console` on port `8080`

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The web app talks to the Console backend through:

```text
NEXT_PUBLIC_CONSOLE_API_BASE_URL=http://localhost:8080
```

## Scope

First migration targets:

- Log Catalog
- Raw Events
- CSV download
- Field Requests

The Console backend remains responsible for ingest, storage, scheduling,
catalog assembly, and API contracts.
