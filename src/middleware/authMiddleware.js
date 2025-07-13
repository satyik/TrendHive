const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

/**
 * Middleware to protect routes (requires valid JWT)
 * Supports both cookie and Authorization header tokens
 */
const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;

    // Check Authorization header if no cookie
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'Account is not activated.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.clearCookie('jwt');
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

/**
 * Middleware to prevent access if already logged in (for login/signup routes)
 */
const redirectIfLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt;

  // Check Authorization header if no cookie
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user && user.active) {
      return res.status(403).json({
        success: false,
        error: 'You are already logged in'
      });
    }

    next();
  } catch {
    next(); // token invalid or expired — proceed normally
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      
      if (user && user.active) {
        req.user = user;
      }
    }

    next();
  } catch (err) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = { requireAuth, redirectIfLoggedIn, optionalAuth }; 