// server/middleware/modOrAdmin.js
const modOrAdmin = (req, res, next) => {
  // We assume the 'auth' middleware has already run
  if (req.user.role === 'admin' || req.user.role === 'moderator') {
    next(); // User is an admin or a mod, allow them
  } else {
    return res.status(403).json({ message: 'Access denied. Requires admin or moderator role.' });
  }
};

module.exports = modOrAdmin;