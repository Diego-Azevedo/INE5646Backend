const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware for login and update routes.
 *
 * Description:
 * This rate limiter is used to prevent brute-force attacks or excessive requests
 * to sensitive routes like login and user update endpoints. It limits each IP address
 * to a maximum number of requests within a defined time window.
 *
 * Parameters:
 * - windowMs: 15 minutes (15 * 60 * 1000 milliseconds)
 * - max: 5 requests allowed per IP within the window
 * - message: Custom JSON response when the limit is exceeded (HTTP 429 Too Many Requests)
 * - standardHeaders: true (sends RateLimit headers conforming to IETF standard)
 * - legacyHeaders: false (disables the older X-RateLimit headers)
 * - handler: Custom function to log rate-limit events and send a JSON error response
 */

// Limit for login route:
const loginUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    message: 'Too many login or update attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, options) => {
    console.log(`[RateLimit] in Login/Update - IP: ${req.ip} | Route: ${req.originalUrl} | Time: ${new Date().toISOString()}`);

    res.status(429).json({ message: 'Too many login or update attempts. Try again later' })
  },
});

// Limit for register route:
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Too many register attempts. Try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    console.log(`[RateLimit] in Register - IP: ${req.ip} | Route: ${req.originalUrl} | Time: ${new Date().toISOString()}`);

    res.status(429).json({ message: 'Too many register attempts. Try again later' })
  },
});

module.exports = { loginUpdateLimiter, registerLimiter };
