import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { ApiError } from './utils/apiError.js';
import { ApiResponse } from './utils/apiResponse.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for mobile development & dev tools
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Development logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiRateLimiter);

// Health check endpoint (always accessible)
app.get('/health', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  return res.status(200).json(
    ApiResponse.success(
      {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'HostelEase Core Backend API',
        status: isDbReady ? 'HEALTHY' : 'DEGRADED_DATABASE_DISCONNECTED',
        database: {
          connected: isDbReady,
          state: mongoose.connection.readyState,
          ipNotice: isDbReady
            ? 'Connected'
            : 'IP Whitelist required in Atlas: add 0.0.0.0/0 or 106.202.121.121 to Network Access',
        },
      },
      isDbReady ? 'Service is healthy' : 'Service online; MongoDB Atlas awaiting IP whitelist'
    )
  );
});

// Guard middleware for database readiness on API endpoints
app.use('/api/v1', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message:
        'MongoDB Atlas connection pending. Please whitelist IP 106.202.121.121 or add 0.0.0.0/0 in MongoDB Atlas -> Security -> Network Access.',
      helpUrl: 'https://cloud.mongodb.com',
    });
  }
  next();
});

// API Root version router
app.use('/api/v1', routes);

// 404 Route Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found on this server`));
});

// Centralized Enterprise Error Handler
app.use(errorHandler);

export default app;
