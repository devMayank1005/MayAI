import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import morgan from 'morgan';

const app = express();

app.use(cors(
	{
		origin: 'http://localhost:5173',
		credentials: true
	}
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));  

app.get('/', (req, res) => {
	res.status(200).json({ success: true, message: 'Server is running' });
});
app.use('/api/auth', authRouter);

export default app;