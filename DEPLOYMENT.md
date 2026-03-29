# Deploy Frontend + Backend Together

This project can be deployed as a single Node.js service where:

- frontend is built with Vite into `frontend/dist`
- backend (Express) serves the built frontend and all API routes

## 1. Install dependencies

Run from the repository root:

```bash
npm run install:all
```

## 2. Build frontend

```bash
npm run build
```

## 3. Start backend (serves API + frontend)

```bash
NODE_ENV=production npm run start
```

The backend serves:

- API under `/api/*`
- frontend app for non-API routes (SPA fallback)
- health check at `/api/health`

## Required backend environment variables

Set these on your hosting platform:

- `PORT` (optional; defaults to `3000`)
- `MONGO_URI`
- `JWT_SECRET`
- any AI provider keys used by your app (for example Google/Mistral/Tavily)

## Optional CORS variables

When frontend and backend are deployed together at the same domain, CORS variables are usually not required.

If you need cross-origin requests, set either:

- `CORS_ALLOWED_ORIGINS=https://app.example.com,https://www.example.com`
- or `FRONTEND_URL=https://app.example.com`

## One-command deploy (local check)

```bash
NODE_ENV=production npm run deploy
```

This runs frontend build and then starts backend.
