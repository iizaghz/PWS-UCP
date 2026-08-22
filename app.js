const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db');
const seed = require('./seed/seed');

const authRoutes = require('./routes/authRoutes');
const keysRoutes = require('./routes/keysRoutes');
const usageRoutes = require('./routes/usageRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { error } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts and CDN images for dashboard
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dashboard assets
app.use(express.static(path.join(__dirname, 'public')));

// Guarantee database initialization and seed completion before processing requests on Vercel Serverless
let initPromise = null;
app.use(async (req, res, next) => {
  if (!initPromise) {
    initPromise = (async () => {
      await db.initDb();
      await seed();
    })();
  }
  try {
    await initPromise;
  } catch (e) {
    console.error('[Middleware Init Error]:', e);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/v1', publicRoutes);

// Single Page Application Fallback for Dashboard
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return error(res, 'ENDPOINT_NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Central Error Handler]:', err);
  return error(res, err.code || 'INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred', err.statusCode || 500);
});

// Start Server and initialize database
async function startServer() {
  await db.initDb();
  await seed(); // Seed default dataset & credentials

  if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`CineData API SaaS Server running on http://localhost:${PORT}`);
      console.log(`Demo Developer Email: admin@cinedata.io | Password: password123`);
      console.log(`Demo Public API Key: cd_live_demo1234567890abcdef`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is currently in use by another process. Automatic recovery in progress...`);
      } else {
        console.error('Server error:', err);
      }
    });
  }
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

module.exports = app;
