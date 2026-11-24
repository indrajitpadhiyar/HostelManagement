import rateLimit from 'express-rate-limit';

// General API rate limiter: 300 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Stricter rate limiter for authentication endpoints: 30 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

export const apiRateLimiter = apiLimiter;
export const authRateLimiter = authLimiter;

