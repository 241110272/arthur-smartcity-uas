const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT Authentication Middleware
 * Melakukan verifikasi JWT token dari Authorization header
 */
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.sub || decoded.id;
    req.user = {
      ...decoded,
      id: userId,
      userId
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
      error: error.message
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Memeriksa apakah user memiliki role yang diizinkan
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient permissions',
      requiredRoles: allowedRoles,
      userRole: req.user.role
    });
  };
};

/**
 * Specific Role Checkers untuk kemudahan penggunaan
 */
const isAdmin = [authenticateJWT, authorize(['admin', 'superadmin'])];
const isSuperAdmin = [authenticateJWT, authorize(['superadmin'])];
const isUser = [authenticateJWT, authorize(['user', 'admin', 'superadmin'])];

module.exports = {
  authenticateJWT,
  authorize,
  isAdmin,
  isSuperAdmin,
  isUser
};
