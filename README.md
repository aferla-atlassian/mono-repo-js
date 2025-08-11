# TypeScript Monorepo: Reading List

This monorepo contains three TypeScript packages:

- `@app/backend`: Reading list domain, service, and file-backed repository
- `@app/analytics`: Analytics utilities for reading list data
- `@app/api`: Express REST API exposing endpoints

## Requirements

- Node.js 18+
- npm 8+ (npm workspaces)

## Install

```
npm install
```

## Build all packages

```
npm run build
```

## Run the API

- Development (watch):

```
npm run dev
```

- Production (after build):

```
npm start
```

The server listens on `PORT` (default `3000`). Data is persisted (JSON) at `DATA_FILE` (default `data/reading-list.json`). Directories are created automatically if missing.

## REST Endpoints

- `GET /health` — service heartbeat
- `GET /books?status=to-read|reading|completed&author=...&tag=...` — list books with optional filters
- `POST /books` — create a book: `{ title, author, pages?, notes?, tags? }`
- `GET /books/:id` — fetch a book
- `PATCH /books/:id` — partial update: `{ title?, author?, pages?, notes?, tags?, status? }`
- `DELETE /books/:id` — remove a book
- `POST /books/:id/status` — change status: `{ status: "to-read"|"reading"|"completed" }`
- `GET /analytics/summary` — get analytics summary

## Example

```
# Add a book
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","pages":464}'

# List books
curl http://localhost:3000/books

# Mark as reading
curl -X POST http://localhost:3000/books/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"reading"}'

# Analytics
curl http://localhost:3000/analytics/summary
```

## Development Notes

- TypeScript project references are used for incremental builds (`tsc -b`).
- The API depends on `@app/backend` and `@app/analytics` via workspace protocols.
- Storage is in-memory with optional JSON persistence on disk. Replace the repository with a DB-backed implementation if needed.
