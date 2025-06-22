const jwt = require('jsonwebtoken');

/**
 * Middleware to validate JWT token on protected routes.
 *
 * Description:
 * This middleware checks if a valid JSON Web Token (JWT) is present in the Authorization header.
 * It is used to protect private routes that require authenticated access.
 *
 * Behavior:
 * - Expects the Authorization header in the format: `Bearer <token>`
 * - Verifies the token using the secret key from environment variables (`process.env.SECRET`)
 * - If the token is missing, invalid, or expired, it returns the appropriate HTTP error response
 *
 * Error Responses:
 * - 401 Unauthorized: Missing Authorization header or token not provided
 * - 403 Forbidden: Token verification failed (invalid or expired token)
 */

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('[Error] Not authorization provide, access denied!');
    return res.status(401).json({ message: 'Access denied!' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('[Error] Token not provided on private route');
    return res.status(401).json({ message: 'Token not provided!' });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    console.error('[Error] Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token!' });
  }
}

module.exports = checkToken;