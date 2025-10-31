// server/middleware/admin.js
const admin = (req, res, next) => {
  // We assume the 'auth' middleware has already run
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Not an admin.' });
  }
  next();
};

module.exports = admin;