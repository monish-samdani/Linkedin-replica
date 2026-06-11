import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './features/auth/auth.route.js';
import usersRouter from './features/users/users.route.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', data: null, statusCode: 200 });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

export default app;
