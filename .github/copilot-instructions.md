## Assistant guidance for Papakjai repository

This file gives concise, actionable guidance for an AI coding assistant working in this repo.

- Project layout (important folders/files):
  - `front-end/` — React app built with Vite. Key files: `front-end/package.json` (scripts: `dev`, `build`, `start` uses `concurrently` to run `backend/server.js` + Vite), `front-end/src/firebase.js` (Firebase client config), `front-end/src/components/` (e.g. `Register.jsx` demonstrates Firebase Auth flows and email verification).
  - `backend/` — Express API. Key file: `backend/server.js` (expects `YOUTUBE_API_KEY` in `.env` and a Firebase service account either via `backend/serviceAccountKey.json` or `FIREBASE_SERVICE_ACCOUNT` env var). Stores caches and favorites in Firestore.
  - `functions/` — Firebase Cloud Functions. `functions/index.js` contains a scheduled job `deleteUnverifiedUsers` (runs every 5 minutes and deletes users older than 10 minutes if unverified). Also exposes HTTP test endpoints (`listAllUsers`, `testDeleteUnverifiedUsers`).
  - `.github/workflows/` — CI builds the front-end and deploys to Firebase Hosting; secrets used: `FIREBASE_SERVICE_ACCOUNT`, `YOUTUBE_API_KEY`.
  - `firebase.json` — hosting / firebase settings used by CI and local firebase tools.

- How to run locally (dev):
  - Install deps at repo root (workspaces): `npm install`.
  - Start both services concurrently (recommended for local dev): `npm run start` (root) — this runs backend and Vite dev server together.
  - Run front-end only: `npm run dev -w front-end` (or `cd front-end && npm run dev`).
  - Run backend only: `npm run dev -w backend` (or `cd backend && npm run dev`).
  - Emulate cloud functions locally: `cd functions && npm run serve` (requires Firebase CLI + emulators).

- Build & deploy notes (what CI does):
  - CI (see `.github/workflows/*.yml`) creates `backend/.env` with `YOUTUBE_API_KEY` and writes `backend/serviceAccountKey.json` from `FIREBASE_SERVICE_ACCOUNT` secret before `npm install` and `npm run build -w front-end`.
  - To reproduce CI locally, set `FIREBASE_SERVICE_ACCOUNT` (JSON) and `YOUTUBE_API_KEY` environment variables or add `backend/serviceAccountKey.json` and `backend/.env`.

- Important patterns & conventions (do not change without checking tests/CI):
  - Firestore is used for caching search results (`videoCache`), `searchHistory`, and `favorites` (see `backend/server.js`). Cache is only used for first page results.
  - Firebase Authentication is used client-side (see `front-end/src/firebase.js`) and server-side via `firebase-admin` in `backend` and `functions`.
  - Cloud Function `deleteUnverifiedUsers` is destructive: it deletes unverified accounts after a short cutoff (10 minutes). Avoid creating many short-lived test users on the live project — use emulators or disable the scheduled job when testing.
  - Service account loading: `backend/server.js` prefers `FIREBASE_SERVICE_ACCOUNT` env JSON (used by CI); fallback reads `backend/serviceAccountKey.json` (local dev).

- Useful file examples to reference when making changes:
  - Auth and verification example: `front-end/src/components/Register.jsx` — shows email verification flow, modal UX, and local cleanup timeout.
  - Scheduled cleanup: `functions/index.js` — shows schedule frequency and deletion logic; tests should consider this behavior.
  - API and caching: `backend/server.js` — search, cache, favorites, and pagination behaviour.

- Safety & secrets:
  - CI injects `FIREBASE_SERVICE_ACCOUNT` and `YOUTUBE_API_KEY`. Never commit new secrets. When testing locally, create `backend/.env` (YOUTUBE_API_KEY) and `backend/serviceAccountKey.json` or set `FIREBASE_SERVICE_ACCOUNT` env var.

- Quick checklist for common tasks:
  - Add new front-end dependency: `cd front-end && npm i <pkg>` and update root `npm install` if using workspaces.
  - Add backend env var: add to local `backend/.env`; update `.github/workflows/*` secrets if needed for CI.
  - Working with functions: use `npm run serve` in `functions/` and test via emulator to avoid accidental deletions in production.

- When opening PRs, check:
  - Front-end builds: `npm run build -w front-end` (CI runs this).
  - Backend startup: `node backend/server.js` (server exits if `YOUTUBE_API_KEY` is missing). Ensure dev docs updated if adding required envs.

If anything above is unclear or you want more detail (example: typical request/response shapes for `/api/videos/search` or how auth state flows through `UserAuthContext.jsx`), tell me which area to expand and I will iterate.
