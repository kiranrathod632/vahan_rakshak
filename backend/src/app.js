const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const tagRoutes = require('./routes/tagRoutes');
const scanRoutes = require('./routes/scanRoutes');
const alertRoutes = require('./routes/alertRoutes');
const adminRoutes = require('./routes/adminRoutes');
const salesRoutes = require('./routes/salesRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts for testing demo page
}));

// CORS Configuration
app.use(cors());

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI (supports both frontend/dist and backend/public)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const backendPublicPath = path.join(__dirname, '../public');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}
if (fs.existsSync(backendPublicPath)) {
  app.use(express.static(backendPublicPath));
}

// Rate Limiting on public scan/alert endpoints to prevent spam attacks
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many alert requests from this IP, please try again after 15 minutes.'
  }
});

// Ensure MongoDB Atlas connection on every request (cached in serverless)
const connectDB = require('./config/db');
const mongoose = require('mongoose');

app.use(async (req, res, next) => {
  // Only connect for API requests
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/tags') || req.path.startsWith('/scan') || req.path.startsWith('/alerts') || req.path.startsWith('/admin') || req.path.startsWith('/sales')) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection error in middleware:', err.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please ensure 0.0.0.0/0 is added in MongoDB Atlas Network Access: https://cloud.mongodb.com',
        error: err.message
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is still connecting. Please try again in a few moments, and ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas.'
      });
    }
  }
  next();
});

// API Routes (Mounted on both /api/* and /* for maximum client flexibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/tags', tagRoutes);
app.use('/tags', tagRoutes);

app.use('/api/scan', scanLimiter, scanRoutes);
app.use('/scan', scanLimiter, scanRoutes);

app.use('/api/alerts', alertRoutes);
app.use('/alerts', alertRoutes);

// Admin Dashboard Routes
app.use('/api/admin', adminRoutes);
app.use('/admin', (req, res, next) => {
  if (req.headers['x-admin-key'] || req.headers.authorization || (!req.accepts('html') && req.path !== '/')) {
    return adminRoutes(req, res, next);
  }
  next();
});

// Sales Team Portal Routes
app.use('/api/sales', salesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'GadiRaksha Smart Vehicle Safety API',
    timestamp: new Date().toISOString()
  });
});

// React SPA Fallback: Serve React index.html for all non-API browser page navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.xhr) {
    return next();
  }
  if (req.accepts('html')) {
    const distHtml = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(distHtml)) {
      return res.sendFile(distHtml);
    }
    const publicHtml = path.join(backendPublicPath, 'index.html');
    if (fs.existsSync(publicHtml)) {
      return res.sendFile(publicHtml);
    }
  }
  next();
});

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
