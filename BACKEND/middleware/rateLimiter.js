const rateLimit = require('express-rate-limit');

// Store for tracking failed attempts per IP
const failedAttempts = new Map();

// Enhanced rate limiter with progressive delays
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    
    handler: (req, res) => {
      const key = req.ip || req.connection.remoteAddress;
      const attempts = failedAttempts.get(key) || 0;
      failedAttempts.set(key, attempts + 1);
      
      const timeoutMultiplier = Math.min(attempts, 10);
      const timeout = 1000 * timeoutMultiplier;
      
      console.log(`Rate limit exceeded for IP ${key}. Attempts: ${attempts + 1}`);
      
      setTimeout(() => {
        res.status(429).json({
          success: false,
          message: `${message} Please wait ${Math.ceil(windowMs / 1000)} seconds.`,
          retryAfter: Math.ceil(windowMs / 1000),
          attempts: attempts + 1
        });
      }, timeout);
    },
    
    onLimitReached: (req, res, options) => {
      const key = req.ip || req.connection.remoteAddress;
      console.log(`Rate limit reached for IP ${key}`);
    }
  });
};

// General API rate limiter (more permissive)
exports.generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests per 15 minutes
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for authentication routes
exports.authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // Only 10 auth attempts per 15 minutes
  'Too many authentication attempts, please try again later.',
  true // Don't count successful requests
);

// Very strict limiter for password reset attempts
exports.passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // Only 3 password reset attempts per hour
  'Too many password reset attempts, please try again later.'
);

// Submission rate limiter (per minute)
exports.submissionLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  15, // 15 submissions per minute
  'Too many submissions, please wait before submitting again.'
);

// Registration limiter (prevent account creation abuse)
exports.registrationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 registrations per hour per IP
  'Too many account creation attempts, please try again later.'
);

// Profile update limiter
exports.profileUpdateLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 profile updates per 5 minutes
  'Too many profile updates, please wait before updating again.'
);

// Clean up failed attempts periodically (every 30 minutes)
setInterval(() => {
  failedAttempts.clear();
  console.log('Cleared failed authentication attempts cache');
}, 30 * 60 * 1000);

// Export utilities for manual cleanup
exports.clearFailedAttempts = (ip) => {
  if (ip) {
    failedAttempts.delete(ip);
  } else {
    failedAttempts.clear();
  }
};

exports.getFailedAttempts = (ip) => {
  return failedAttempts.get(ip) || 0;
};