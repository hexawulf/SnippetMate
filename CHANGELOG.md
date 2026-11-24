# Changelog

All notable changes to SnippetMate are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-11-24

### Added
- Teal colourway matching sibling apps (`#0f766e` accent, `#0d9488` brand tile, slate neutrals) in `frontend/src/assets/theme.css`.
- Light and dark mode following `prefers-color-scheme`, persisted in `localStorage` with a pre-paint inline script in `frontend/index.html` and a NavBar/sign-in theme toggle (`frontend/src/utils/theme.js` + unit tests).
- Sibling-style signed-out hero screen with logo tile, feature summary, GitHub link, and version footer.
- Responsive mobile tag filter strip (`< md`) and consolidated `Data` export/import dropdown menu in `NavBar`.
- Explicit backend error banner with retry button on load failures, plus distinct empty vs zero-match filter messaging.
- E2E build-mode auth seam (`vite build --mode e2e`) and CI check verifying production builds exclude it.
- `CHANGELOG.md` with release history from v2.0.0 onward.

### Changed
- Dropped Bootswatch "United" (eliminating third-party Google Fonts requests and 56 WCAG AA contrast violations) in favour of plain Bootstrap 5.3 CSS + `theme.css`.
- Replaced duplicate Bootstrap UMD JS bundle (`bootstrap.bundle.min.js`) with direct `bootstrap/js/dist/modal` imports and removed direct `@popperjs/core` dependency (~130 kB smaller JS bundle).
- Replaced `nodemon` with Node's built-in `node --watch server.js` in `backend/package.json` (0 audit vulnerabilities across all deps).
- Updated SweetAlert2 dialogs via shared `frontend/src/utils/swal.js` helper to match the teal accent and light/dark themes.
- Replaced rainbow card borders with neutral 1 px card borders, rendered snippet content in keyboard-focusable `<pre tabindex="0">` blocks, made card and sidebar tags accessible `<button>` filters, and formatted timestamps cleanly.
- Updated `frontend/public/favicon.svg` to the teal brand tile (`#0d9488`) and refreshed `docs/snippetmate_screenshot.png`.

### Fixed
- Replaced real LAN IP addresses and production port in `backend/test/fetch-title.test.js` with generic RFC1918 / localhost addresses.
- Set `application/json` MIME type when downloading JSON exports (`frontend/src/utils/markdown.js`).
- Added missing modal ARIA attributes, form labels, `modal.dispose()` cleanup, and `rel="noopener noreferrer"` on the sidebar GitHub link.
- Updated drifted documentation in `README.md` and `AGENTS.md`.

## [2.1.0] - 2026-06-26

JSON snippet import and export.

- GET /api/snippets/export — authoritative, uid-scoped JSON export (canonical round-trip format).
- POST /api/snippets/import — validation, dedup skip, tag reconciliation, per-snippet transactions.
- NavBar: Import + Export JSON, with post-import list/tag refresh.

Closes the import/export loop from the README.

## [2.0.0] - 2026-06-25

## SnippetMate v2.0.0

First multi-user release of SnippetMate — capture, tag, and search text & code snippets, now with authenticated accounts.

### Highlights
- **Google sign-in (Firebase Auth)** — snippets are now scoped to your account.
- **About modal** — accessible "About" dialog in the navbar with project info and links.

### Fixes
- **Auth: firebase-admin v14 migration** — backend updated to the modular `firebase-admin/app` + `firebase-admin/auth` imports. The legacy `admin.apps` / `admin.auth()` namespace pattern was removed in v12+, which had been causing every authenticated request to fail with a silent 401. Authenticated routes now verify ID tokens correctly.
- **Frontend auth header** — axios request interceptor now attaches the `Authorization` bearer token via `AxiosHeaders.set()`.
- **UI polish** — refined the navbar info button and accessibility labels on the About modal.

### Stack
Vue 3 · Vite · Bootstrap 5 · Express · MySQL 8 · Firebase Auth
