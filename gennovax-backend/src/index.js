import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';

import casesRoutes from './routes/cases.routes.js';
import doctorsRoutes from './routes/doctors.routes.js';
import metaRoutes from './routes/meta.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import driveRoutes from './routes/drive.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import aiAnalyticsRoutes from './routes/ai-analytics.routes.js';
import servicesRoutes from './routes/services.routes.js';

import { requireAuth } from './middlewares/auth.middleware.js';
import { browserGate } from './middlewares/browserGate.middleware.js';
import { startAutoBackup } from './services/backup.service.js';
import { startMailTrackingJob } from './services/netpostTracking.service.js';

dotenv.config();

const app = express();

// Trust proxy when running behind Nginx/Vercel/Render/Heroku...
app.set('trust proxy', true);

morgan.token('date-vn', () => {
  return new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });
});

morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  const color =
    status >= 500
      ? 31
      : status >= 400
        ? 33
        : status >= 300
          ? 36
          : status >= 200
            ? 32
            : 0;
  return `\x1b[${color}m${status}\x1b[0m`;
});

morgan.token('client-ip', (req) => {
  const ip =
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  return ip?.split(',')[0].trim() || 'Unknown IP';
});

morgan.token('client-origin', (req) => {
  return req.headers['origin'] || req.headers['referer'] || 'Direct/Unknown';
});

morgan.token('actor', (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) return 'Anonymous';

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.email) return payload.email;
    if (payload?.role && payload?.sub) return `${payload.role}/${payload.sub}`;
    if (payload?.sub) return String(payload.sub);
    return 'Authenticated';
  } catch {
    return 'Invalid token';
  }
});

app.use(
  morgan(
    '\x1b[90m[:date-vn]\x1b[0m ' +
      '\x1b[36m[:client-ip]\x1b[0m ' +
      '\x1b[33m[:client-origin]\x1b[0m ' +
      '\x1b[35m:method\x1b[0m :url :status-colored ' +
      '\x1b[90m:response-time ms\x1b[0m ' +
      '- \x1b[90m:actor\x1b[0m',
    {
      skip: (req) => req.method === 'OPTIONS',
    }
  )
);

app.use(express.json({ limit: '2mb' }));

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

startAutoBackup();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', requireAuth, userRoutes);

app.use('/api/cases', browserGate(ALLOWED_ORIGINS), requireAuth, casesRoutes);
app.use(
  '/api/doctors',
  browserGate(ALLOWED_ORIGINS),
  requireAuth,
  doctorsRoutes
);
app.use(
  '/api/services',
  browserGate(ALLOWED_ORIGINS),
  requireAuth,
  servicesRoutes
);
app.use('/api/meta', browserGate(ALLOWED_ORIGINS), requireAuth, metaRoutes);
app.use('/api/upload', browserGate(ALLOWED_ORIGINS), requireAuth, uploadRoutes);
app.use('/api/drive', browserGate(ALLOWED_ORIGINS), requireAuth, driveRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ai', aiAnalyticsRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err?.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    startMailTrackingJob();
    app.listen(PORT, () =>
      console.log(`API dang lang nghe tai: http://localhost:${PORT}`)
    );
  })
  .catch((e) => {
    console.error('Loi ket noi MongoDB:', e);
    process.exit(1);
  });
