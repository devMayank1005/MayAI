import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend distribution path (resolved at build/runtime)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

const normalizeOrigin = (value) => value?.trim().replace(/\/$/, '');

// CORS configuration: support environment-based frontend URL allowlist
const envAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS
	? process.env.CORS_ALLOWED_ORIGINS.split(',').map((url) => normalizeOrigin(url)).filter(Boolean)
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

		// Allow requests with no origin (like mobile apps, curl requests)
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));  
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Routes
app.get('/api/health', (req, res) => {
	res.status(200).json({ success: true, message: 'Server is running' });
});
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

// Serve frontend static files (in production)
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
	app.use(express.static(frontendDistPath));
	
	// SPA fallback: serve index.html for all non-API routes
	app.use((req, res, next) => {
		if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
			res.sendFile(path.join(frontendDistPath, 'index.html'));
		} else {
			next();
		}
	});
}

export default app;