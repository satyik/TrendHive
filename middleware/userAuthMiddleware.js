const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
require('dotenv').config();

// Middleware to protect routes (requires valid JWT)
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }

    req.user = user; // attach user to req object
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

// Middleware to prevent access if already logged in (for login/signup routes)
const redirectIfLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      return res.status(403).json({ error: 'You are already logged in' });
    }

    next();
  } catch {
    next(); // token invalid or expired — proceed normally
  }
};

module.exports = { requireAuth, redirectIfLoggedIn };
