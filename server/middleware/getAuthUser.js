// server/middleware/getAuthUser.js
const jwt = require('jsonwebtoken');

// This middleware is "optional auth".
// It tries to get the user, but doesn't fail if no token is provided.
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(); // No token, just continue without a user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // Add user to request
    next();
  } catch (err) {
    // Token is invalid, but we don't care, just continue
    next();
  }
};