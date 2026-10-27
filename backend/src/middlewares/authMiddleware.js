const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gadiraksha_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin only.' });
  }
};

const adminKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'] || req.query.adminKey;
  const configuredKey = process.env.ADMIN_API_KEY || 'gadiraksha_admin_secret_batch_gen_key_2026';

  if (apiKey && apiKey === configuredKey) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Invalid Admin API Key' });
  }
};

/**
 * Combined Admin Auth: Accepts either X-ADMIN-KEY header OR Bearer JWT with role === 'admin'
 */
const adminAuth = async (req, res, next) => {
  const apiKey = req.headers['x-admin-key'] || req.query.adminKey;
  const configuredKey = process.env.ADMIN_API_KEY || 'gadiraksha_admin_secret_batch_gen_key_2026';

  // 1. Check if valid Admin API key provided
  if (apiKey && apiKey === configuredKey) {
    req.isAdminKey = true;
    return next();
  }

  // 2. Alternatively check Bearer JWT token with admin role
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gadiraksha_secret');
      const user = await User.findById(decoded.id).select('-password');
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Token invalid
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin credentials or valid X-ADMIN-KEY required.'
  });
};

/**
 * Super Admin Auth: Requires role === 'superadmin'
 */
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Super Admin only.' });
  }
};

/**
 * Sales Agent Auth: Requires role === 'sales', 'admin', or 'superadmin'
 */
const salesAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const apiKey = req.headers['x-admin-key'] || req.query.adminKey;
  const configuredKey = process.env.ADMIN_API_KEY || 'gadiraksha_admin_secret_batch_gen_key_2026';
  if (apiKey && apiKey === configuredKey) {
    req.isAdminKey = true;
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gadiraksha_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    if (['sales', 'admin', 'superadmin'].includes(user.role)) {
      req.user = user;
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied: Sales or Admin role required.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

module.exports = { protect, adminOnly, adminKeyAuth, adminAuth, superAdminOnly, salesAuth };
