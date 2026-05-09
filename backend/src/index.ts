import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import salariesRouter from './routes/salaries';
import companyRouter from './routes/company';
import compareRouter from './routes/compare';

const app = express();
const PORT = process.env.PORT ?? 4000;

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',').map(s => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error('CORS: origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/', salariesRouter);
app.use('/', companyRouter);
app.use('/', compareRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
