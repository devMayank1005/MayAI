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
- `BASE_URL` (for email verification links)
- `FRONTEND_URL` (for verify success redirect)
- `SOCKET_ORIGIN` (socket.io CORS origin)
- `BREVO_SMTP_USER` (Brevo SMTP Login, e.g. `a6722c001@smtp-brevo.com`)
- `BREVO_SMTP_PASS` (Brevo SMTP/API key)
- `BREVO_SENDER_EMAIL` (visible sender email)
- any AI provider keys used by your app (for example Google/Mistral/Tavily)

For this deployment:

- `BASE_URL=https://mayai-ozbt.onrender.com`
- `FRONTEND_URL=https://mayai-ozbt.onrender.com`
- `SOCKET_ORIGIN=https://mayai-ozbt.onrender.com`

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

## Post-deploy verification (mail + routes)

Run these checks after deploy:

1. Health route: `GET /api/health` should return success.
2. Auth routes:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
	- `GET /api/auth/verify-email?token=...`
	- `POST /api/auth/resend-verification`
3. Registration should return quickly (non-blocking mail dispatch).
4. Backend logs should show either:
	- `Email sent: ...`
	- `Verification email sent to ...`
5. Brevo dashboard should show the transactional email as accepted/delivered.
