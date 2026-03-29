import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';

const app = express();

// Required on Render/proxy deployments so req.ip reflects client IP.
app.set('trust proxy', 1);

// Fix __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

// Resolve frontend dist path independent of process working directory.
const frontendDistCandidatePaths = [
	path.join(repoRoot, 'frontend', 'dist'),
	path.join(process.cwd(), 'frontend', 'dist'),
];
const frontendDistPath = frontendDistCandidatePaths.find((candidate) => fs.existsSync(candidate)) || frontendDistCandidatePaths[0];
const uploadsPath = path.join(repoRoot, 'backend', 'uploads');

// --------------------
// MIDDLEWARES
// --------------------
app.use(cors({
	origin: true,
	credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(uploadsPath));

// --------------------
// API ROUTES
// --------------------
app.get('/api/health', (req, res) => {
	res.json({ success: true, message: 'Server running' });
});

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

// --------------------
// FRONTEND SERVING
// --------------------
if (process.env.NODE_ENV === 'production') {
	console.log("Serving frontend from:", frontendDistPath);

	// Serve static assets
	app.use(express.static(frontendDistPath));

	// SPA fallback (IMPORTANT: works in Express 4)
	app.get('*', (req, res) => {
		res.sendFile(path.join(frontendDistPath, 'index.html'));
	});
}

export default app;