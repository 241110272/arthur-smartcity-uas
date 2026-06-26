const passport = require('../config/passport.config');

/**
 * Authentication Middleware
 * Memverifikasi JWT token dari request dengan strategy passport-jwt
 */
const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau kadaluarsa'
      });
    }
    req.user = user;
    req.user.userId = user.id; // compatibility with controllers expecting req.user.userId
    next();
  })(req, res, next);
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke resource ini'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorize
};
