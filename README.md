# UMHackathon-Byte-Me

Integrated frontend/backend setup for the OpportunIQ app:

- `backend/`: FastAPI API with persisted mock state under `backend/data/state`
- `react-router-app/`: React Router frontend that now loads real data from `/api/*`

## Run locally

1. Install backend dependencies:
   `npm run backend:install`
2. Start the backend:
   `npm run backend:dev`
3. In a second terminal, install frontend dependencies once:
   `cd react-router-app && npm install`
4. Start the frontend:
   `cd react-router-app && npm run dev`

Default local ports:

- Frontend: `http://127.0.0.1:3000` or the next free port
- Backend: `http://127.0.0.1:8000`

If the backend runs on a different port, set these before starting the frontend:

- `VITE_API_BASE_URL=http://127.0.0.1:<port>`
- `VITE_API_PROXY_TARGET=http://127.0.0.1:<port>`

## Verification

- Frontend typecheck: `npm run frontend:typecheck`
- Frontend production build: `npm run frontend:build`
- Backend tests: `npm run backend:test`
