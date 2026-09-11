const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
// Restrict to known frontend origins, dynamically permitting localhost ports in development.
const envOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, scripts, or non-browser clients (no origin)
    if (!origin) return callback(null, true);

    // In development mode, allow any localhost or 127.0.0.1 port
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/^https?:\/\//, ''))) {
      return callback(null, true);
    }

    // Automatically permit Render domains (*.onrender.com)
    const hostname = origin.replace(/^https?:\/\//, '').split(':')[0];
    if (hostname.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin '${origin}' not allowed.`));
  },
  credentials: true
}));

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// Body size limit prevents DoS via oversized payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
// 200 requests per 15 minutes per IP across all routes
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 200 }));

// Stricter rate limit on authentication endpoints (brute-force protection)
// 50 requests per 15 minutes — enough for dev/testing while still protecting against brute force
const authRateLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 50 });

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'OK',
    service: 'Agri Marketplace API Engine',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Centralized error handling
app.use(errorHandler);

// Start Server & DB
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    const dataService = require('./services/dataService');
    await dataService.syncToMongo();
  }
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 KrishiDirect Agri Marketplace API Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛡️  CORS origins: ${allowedOrigins.join(', ')}`);
    console.log(`=======================================================`);
  });
};

startServer();
