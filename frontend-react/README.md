# SmartDocs Frontend

React 19 + TypeScript SPA for SmartDocs, built with Vite. For the project pitch and how to run the
whole stack, see the [root README](../README.md).

## Pages

Login, then behind the app shell (sidebar navigation, collapses to a drawer under ~900px):
Dashboard, Documents, Upload, Tasks, Audit, Settings (`src/pages/`, routed in `src/App.tsx`).

## Talking to the backend

`src/lib/api.ts` wraps `fetch` against `VITE_API_URL` (defaults to `http://localhost:8080`),
attaching the JWT from `src/lib/auth.ts` as a `Bearer` token on every request. All core flows
(login, documents, upload, tasks, audit) hit the real backend API — nothing is mocked there.
Widgets with no backing aggregation endpoint yet (e.g. the dashboard's weekly chart) are explicitly
labeled "demo data" in the UI rather than presented as real.

## Running locally

```bash
npm install
cp .env.example .env   # set VITE_API_URL if the backend isn't on localhost:8080
npm run dev
```

Requires the backend running (see the root README) — this app has no data of its own.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server (default: `http://localhost:5173`) |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Stack

React 19, TypeScript, Vite, react-router-dom. No UI framework/component library — styling is
plain CSS (`src/styles/global.css`).
