# MayAI

MayAI is a full-stack AI chat application with authentication, real-time chat updates, and email-based account verification.

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router
- Backend: Node.js, Express, MongoDB, Socket.IO
- Auth: JWT + cookie-based sessions
- Email: Brevo API (primary) with SMTP fallback

## Project Structure

```text
MayAI/
  backend/
    src/
      controller/
      middleware/
      models/
      routes/
      services/
      sockets/
  frontend/
    src/
      app/
      features/
  DEPLOYMENT.md
  package.json
```

## Features

- User registration and login
- Email verification flow
- Resend verification with server-side rate limiting
- Real-time chat with Socket.IO
- AI-powered assistant responses
- API-first email delivery via Brevo with SMTP fallback for resilience

## Quick Start (Local)

### 1) Install dependencies

From repo root:

```bash
npm run install:all
```

### 2) Configure backend environment

Create/update `backend/.env` with required values (example keys below):

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
SOCKET_ORIGIN=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_password
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

MISTRAL_API_KEY=your_mistral_key
GEMINI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
```

### 3) Start backend

```bash
cd backend
npm run dev
```

### 4) Start frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

## Root Scripts

From repo root:

- `npm run install:all` installs backend + frontend dependencies
- `npm run build` builds frontend
- `npm run start` starts backend
- `npm run deploy` builds frontend and starts backend

## Deployment (Render)

See full guide in `DEPLOYMENT.md`.

Minimum required env vars on Render:

- `NODE_ENV=production`
- `BASE_URL`
- `FRONTEND_URL`
- `SOCKET_ORIGIN`
- `MONGO_URI`
- `JWT_SECRET`
- `BREVO_SMTP_USER`
- `BREVO_SMTP_PASS`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`

## Email Delivery Notes

- Primary path: Brevo HTTP API (`/v3/smtp/email`)
- Fallback path: Brevo SMTP (`587`, `2525`, `465`)
- Startup verification logs mail transport health
- Resend verification endpoint is rate-limited

## API Highlights

Auth routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/get-me`
- `POST /api/auth/logout`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/resend-verification`

Health route:

- `GET /api/health`

## Troubleshooting

- If email works locally but fails on Render, verify Render env values and redeploy.
- Check Render logs for mail diagnostics and Brevo API acceptance logs.
- Check Brevo transactional logs for final delivery status.

