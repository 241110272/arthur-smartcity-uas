const passport = require('../config/passport.config');

/**
 * JWT Authentication Middleware
 * Melakukan verifikasi JWT token dengan strategy passport-jwt
 */
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token'
      });
    }
    req.user = user;
    req.user.userId = user.id; // compatibility with controllers expecting req.user.userId
    next();
  })(req, res, next);
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
