# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docker

```bash
# Build the image
docker build -t cassandra-playground .

# Run — connect to a Cassandra instance on the host machine
docker run -p 3001:3001 cassandra-playground

# Pass a different port if needed
docker run -p 8080:8080 -e PORT=8080 cassandra-playground
```

The container serves the React SPA and the NestJS API on the same port. Open `http://localhost:3001` in the browser.

The app does **not** bundle a Cassandra instance — it connects to an external one at runtime via the connection form.

## What this is

A web-based Cassandra query playground. Users connect to a Cassandra instance, browse the schema tree (keyspaces → tables), write CQL in a CodeMirror editor, and view tabular results. The monorepo has two packages under `packages/`: a NestJS backend and a React/Vite frontend.

## Commands

All commands below should be run from the repo root unless noted otherwise.

**Run both services together (recommended for development):**
```bash
npm run dev
```

**Run individually:**
```bash
npm run start:dev -w backend   # NestJS on :3001, watch mode
npm run dev -w frontend        # Vite on :5173, proxies /api/* → :3001
```

**Build:**
```bash
npm run build                  # builds both packages
npm run build -w backend       # NestJS only
npm run build -w frontend      # Vite only
```

**Backend tests:**
```bash
npm run test -w backend                # all unit tests
npm run test -w backend -- --testPathPattern=app  # single test file
npm run test:e2e -w backend            # e2e tests (test/jest-e2e.json)
npm run test:cov -w backend            # with coverage
```

**Lint & format (backend):**
```bash
npm run lint -w backend        # ESLint with auto-fix
npm run format -w backend      # Prettier
```

**Lint (frontend):**
```bash
npm run lint -w frontend
```

## Architecture

### Backend (`packages/backend/src/`)

NestJS app, port 3001, global prefix `/api`. Three feature modules each following the NestJS module/controller/service pattern:

- **CassandraModule** — owns the single `cassandra-driver` `Client` instance. `CassandraService` is a singleton that holds the live connection and is shared by the other modules. Connect is established on demand via `POST /api/connect`; there is no config-file connection — the client sends credentials at runtime.
- **SchemaModule** — reads `system_schema` to expose keyspaces/tables/column metadata (`GET /api/keyspaces`, `GET /api/keyspaces/:ks/tables`, `GET /api/keyspaces/:ks/tables/:table`).
- **QueryModule** — executes arbitrary CQL strings (`POST /api/query { cql, keyspace? }`). Results serialize Cassandra-specific types (Long, UUID, InetAddress, Buffer, Date, bigint) to plain JSON in `QueryService.serializeValue`.

`AllExceptionsFilter` (`common/`) catches all errors and returns `{ statusCode, message, path }`.

### Frontend (`packages/frontend/src/`)

React 19 + Vite. Vite proxies `/api/*` to `:3001` so the frontend never needs to hardcode the backend URL.

- **`api.ts`** — all HTTP calls, typed with `ConnectConfig`, `QueryResult`, `TableSchema`.
- **`App.tsx`** — root layout: `ConnectionBar` (top bar) + `SchemaTree` (left sidebar) + `QueryEditor` + `ResultsPane`.
- **`QueryEditor`** — CodeMirror 6 editor with SQL highlighting (`@codemirror/lang-sql`), one-dark theme, `Ctrl+Enter` / `Cmd+Enter` to execute. Exposed via `forwardRef` with `{ getValue, setValue }` so `App` can inject a `SELECT * FROM …` when the user clicks a table.
- **`SchemaTree`** — lazy-loads tables on keyspace expand; re-fetches keyspaces whenever `refreshTrigger` increments (set by `ConnectionBar` on successful connect).
- **`ResultsPane`** — displays query results as a scrollable table or error message.
