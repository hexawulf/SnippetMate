# AGENTS.md — SnippetMate

SnippetMate is a single-page snippet manager (capture, tag, and search short text/code
snippets). Version 2 is in progress: a multi-user refactor adding Google sign-in via Firebase
on top of the original single-user app. Markdown export already shipped in V2.

Repo: github.com/hexawulf/SnippetMate

## Where this runs (ground truth — trust this over any other host list)

- This project lives and runs on **piapps** (Raspberry Pi 5, Ubuntu, the nginx app host).
  Working copy: /home/zk/projects/SnippetMate
- It does NOT run on piapps2 — that box is the OpenClaw/Docker host. Ignore any note that says
  "new services live on piapps2"; SnippetMate is an nginx-served app on piapps.
- MySQL 8.4 runs locally on piapps. Database `snippetmate`, user `snippetmate_user@localhost`.
  The CLI does not read backend/.env; connect with `mysql -u snippetmate_user -p snippetmate`.
- Never invent or assume a hostname. If you need to know where you are, run `hostname`.

## Stack

- Frontend: Vue 3 + Vite + Bootstrap 5 (Bootswatch "United") + SweetAlert2. ES modules.
- Backend: Node.js + Express, CommonJS (`require`). Entry backend/server.js, routes in backend/routes/.
- DB: MySQL 8 via a mysql2 promise pool (backend/db.js), config from process.env. No external APIs.

## Architecture conventions

Frontend:
- Composition API with `<script setup>` everywhere. No Options API.
- No Vue Router, no Pinia. Single screen; shared state lives in App.vue, flows via props/emits.
- `ref()` for state (not `reactive()`); `computed` for derived state (not methods).
- `defineProps` in object form with type + required; array/object defaults use factory functions.
- API calls go through services/api.js (axios), imported in components, not main.js.
- Custom CSS classes use an `sm-` prefix; shared design-system styles live unscoped in App.vue.

Backend:
- CommonJS throughout. One route file per resource under backend/routes/.
- Parameterised queries only (the `?` placeholder form). Never string-interpolate into SQL.

## Multi-user data model (V2)

- `users` table keyed by `firebase_uid` (unique); internal `id` is the FK target.
- `snippets.user_id` -> users(id), NOT NULL, ON DELETE CASCADE. Every snippet has one owner.
- Tags stay GLOBAL — the `tags` table has NO user_id. Per-user scoping happens through the
  snippets join (the sidebar lists only tags on the current user's snippets). Do not add
  user_id to tags.
- User upsert pattern (mirrors the existing tag upsert):
  INSERT INTO users (firebase_uid, email, display_name) VALUES (?,?,?)
  ON DUPLICATE KEY UPDATE email=VALUES(email), display_name=VALUES(display_name),
  id=LAST_INSERT_ID(id)  -- then read insertId as the user id.
- EVERY snippet/tag query must be scoped by the authenticated user's id. A missing
  `WHERE user_id = ?` is a security bug (one user reading another's data), not a style issue.

## Secrets & environment

- Backend reads backend/.env (DB_* + GOOGLE_APPLICATION_CREDENTIALS). Frontend reads
  frontend/.env.local (VITE_FIREBASE_*). Both are gitignored.
- The Firebase Admin SDK loads its key via GOOGLE_APPLICATION_CREDENTIALS, which points at a JSON
  file OUTSIDE the repo (/home/zk/secrets/snippetmate/). Never move the key into the repo, never
  print it, never commit any .env or key file.

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
- Tests: cd backend && npm test  (node:test + supertest; integration tests hit the real DB).
- Load DB: mysql -u snippetmate_user -p snippetmate < db/schema.sql  then  < db/seed.sql

## Non-negotiables

- Never claim you did something you didn't actually run. If you didn't verify it, say so.
- Prefer editing files directly over shell heredocs. Use absolute paths.
- Don't touch .env files, secrets, keys, ~/.ssh, ~/.gnupg, or production nginx config without
  explicit confirmation.
