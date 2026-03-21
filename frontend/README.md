# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## API Setup (Local Dev)

This frontend is configured to call auth APIs through a Vite proxy.

1. Copy `.env.example` to `.env`.
2. Keep `VITE_API_BASE_URL=/api/auth` for proxy-based calls.
3. Set `VITE_BACKEND_URL` to your backend server (default: `http://localhost:3000`).

Run backend and frontend in separate terminals:

```bash
# backend
cd ../backend
npm run dev

# frontend
cd ../frontend
npm run dev
```

With this setup, frontend requests use `/api/...` and Vite forwards them to the backend target.
