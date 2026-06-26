# AGENTS.md — SnippetMate

SnippetMate is a single-page snippet manager (capture, tag, and search short text/code
snippets). Version 2 shipped: multi-user with Google sign-in via Firebase and full per-user
data isolation, plus Markdown export, on top of the original single-user app. v2.1.0 added
JSON import/export (a canonical round-trip format for backup and restore).

Repo: github.com/hexawulf/SnippetMate

## Where this runs

- Runs as an nginx-fronted Node + MySQL app on a single Linux host; MySQL runs locally.
- Never assume a hostname — run `hostname` if it matters.
- Database `snippetmate`. The CLI does not read backend/.env; connect with
  `mysql -u <DB_USER> -p snippetmate` using the credentials in backend/.env.

## Stack

- Frontend: Vue 3 + Vite + Bootstrap 5 (Bootswatch "United") + SweetAlert2 + Firebase web SDK. ES modules.
- Backend: Node.js + Express, CommonJS (`require`). Entry backend/server.js, routes in backend/routes/.
- DB: MySQL 8 via a mysql2 promise pool (backend/db.js), config from process.env. No external data APIs.

## Architecture conventions

Frontend:
- Composition API with `<script setup>` everywhere. No Options API.
- No Vue Router, no Pinia. Single screen; shared state lives in App.vue, flows via props/emits.
  Components are presentational triggers; App.vue owns the data and the refresh path
  (loadSnippets/loadTags) — emit up to it rather than fetching inside a child.
- `ref()` for state (not `reactive()`); `computed` for derived state (not methods).
- `defineProps` in object form with type + required; array/object defaults use factory functions.
- API calls go through services/api.js (one shared axios instance whose interceptor attaches the
  Firebase ID token), imported in components, not main.js.
- Custom CSS classes use an `sm-` prefix; shared design-system styles live unscoped in App.vue.

Backend:
- CommonJS throughout. One route file per resource under backend/routes/
  (health, snippets — including the `/import` and `/export` JSON endpoints — tags, fetch-title).
- Parameterised queries only (the `?` placeholder form). Never string-interpolate into SQL.
- Multi-row writes that must stay atomic borrow one connection from the pool
  (`db.getConnection()` → `beginTransaction`/`commit`/`rollback` → `release`). Import commits
  per snippet so one bad row rolls back alone while valid rows still land.
- Dedup / ownership checks use an explicit `SELECT`, not `affectedRows` — MySQL counts changed
  rows, not matched rows, so `affectedRows` lies for "did this already exist / does this belong
  to the user" logic.
- JSON import/export share one envelope (`format: "snippetmate-export"`, `version`, `snippets[]`).
  Import never trusts `id`/`user_id` from the file; ownership comes from the verified token.

## Multi-user data model

- `users` table keyed by `firebase_uid` (unique); internal `id` is the FK target.
- `snippets.user_id` -> users(id), NOT NULL, ON DELETE CASCADE. Every snippet has one owner.
- Tags stay GLOBAL — the `tags` table has NO user_id. Per-user scoping happens through the
  snippets join (the sidebar lists only tags on the current user's snippets). Do not add
  user_id to tags. Reconcile tag names with the existing upsert idiom
  (`INSERT ... ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`), then link via snippet_tags.
- User upsert pattern (mirrors the tag upsert):
  INSERT INTO users (firebase_uid, email, display_name) VALUES (?,?,?)
  ON DUPLICATE KEY UPDATE email=VALUES(email), display_name=VALUES(display_name),
  id=LAST_INSERT_ID(id)  -- then read insertId as the user id.
- EVERY snippet/tag query must be scoped by the authenticated user's id. A missing
  `WHERE user_id = ?` is a security bug (one user reading another's data), not a style issue.

## Auth

- backend/middleware/auth.js verifies the Firebase ID token via the Admin SDK and sets
  `req.userId` (the internal users.id) for downstream handlers. It is mounted at the router level
  (`app.use('/api/snippets', auth, ...)`), so routes inherit auth — don't re-add it per route.
- Any test-only auth shim MUST be hard-gated behind `process.env.NODE_ENV === 'test'`, evaluated
  once at module load so no request input can reach it. It must be unreachable in production.

## Secrets & environment

- Backend reads backend/.env (DB_* + GOOGLE_APPLICATION_CREDENTIALS). Frontend reads
  frontend/.env.local (VITE_FIREBASE_*). Both are gitignored.
- The Firebase Admin SDK loads its key from the path in GOOGLE_APPLICATION_CREDENTIALS; that file
  lives outside the repo and is never committed. Never move the key into the repo, never print it,
  never commit any .env or key file.

## Code style

- Keep it lean. Comment only genuinely non-obvious logic; no narration comments.
- No speculative abstractions — rule of three before extracting a helper.
- No new npm dependencies without a clear reason.

## Commits

- GPG-sign every commit (`-S`). Conventional Commits with a scope: feat(db):, fix(frontend):,
  chore(security):. First-person, concise subject; body only when it adds something.

## How to run & verify

- Backend: cd backend && npm install && npm start  -> http://localhost:3000
- Frontend: cd frontend && npm install && npm run dev  -> http://localhost:5173
  (requires frontend/.env.local with VITE_FIREBASE_* for sign-in to work).
- Tests: cd backend && npm test  (node:test + supertest; integration tests hit the real DB and
  cover CRUD, search/tag filter, JSON import/export, the 401 auth boundary, and a second-user
  round-trip).
- Load DB: mysql -u <DB_USER> -p snippetmate < db/schema.sql  then  < db/seed.sql

## Non-negotiables

- Never claim you did something you didn't actually run. If you didn't verify it, say so.
- Prefer editing files directly over shell heredocs. Use absolute paths.
- Don't touch .env files, secrets, keys, ~/.ssh, ~/.gnupg, or production nginx config without
  explicit confirmation.
- Never weaken the production auth path (real token verification + `WHERE user_id = ?` scoping)
  to make a test pass or a task easier.
