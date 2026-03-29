import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to frontend build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// --------------------
// CORS CONFIG
// --------------------
const normalizeOrigin = (value) => value?.trim().replace(/\/$/, '');

const envAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS
	? process.env.CORS_ALLOWED_ORIGINS.split(',')
			.map((url) => normalizeOrigin(url))
			.filter(Boolean)
	: [];

const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL);

const isProdLike = ['production', 'staging'].includes(process.env.NODE_ENV);

const defaultDevOrigins = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:4173',
	'http://127.0.0.1:4173'
];

const allowedOrigins = Array.from(
	new Set([
		...envAllowedOrigins,
		...(frontendUrl ? [frontendUrl] : []),
		...(!isProdLike ? defaultDevOrigins : [])
	])
);

const corsOptions = {
	origin: (origin, callback) => {
		const normalizedOrigin = normalizeOrigin(origin);

		if (!normalizedOrigin || allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
};

// --------------------
// MIDDLEWARES
// --------------------
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads (if any)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// --------------------
// API ROUTES
// --------------------
app.get('/api/health', (req, res) => {
	res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

// --------------------
// FRONTEND SERVING (CRITICAL FIX)
// --------------------
// --------------------
// FRONTEND SERVING (FIXED)
// --------------------
// --------------------
// FRONTEND SERVING (FIXED)
// --------------------
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {

	// Use process.cwd() → ALWAYS correct on Render
	const frontendDistPath = path.join(process.cwd(), 'frontend/dist');

	console.log("Serving frontend from:", frontendDistPath);

	// 1. Serve assets explicitly (VERY IMPORTANT)
	app.use('/assets', express.static(path.join(frontendDistPath, 'assets')));

	// 2. Serve full frontend
	app.use(express.static(frontendDistPath));

	// 3. SPA fallback (only for non-file routes)
	app.get('*', (req, res) => {
		res.sendFile(path.join(frontendDistPath, 'index.html'));
	});
}

// --------------------
export default app;