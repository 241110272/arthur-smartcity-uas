const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

/**
 * Session Configuration untuk Server-Side Session Management
 * Memberikan additional security layer selain JWT
 */
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent client-side JS from accessing cookie
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    name: 'smartcity_sessionid' // Custom session name
  },
  name: 'smartcity_sessionid'
});

/**
 * Cookie Parser Configuration
 * Untuk parsing cookies dari request
 */
const cookieConfig = cookieParser(process.env.SESSION_SECRET || 'your-session-secret-key');

/**
 * Session Middleware Wrapper
 * Menambahkan session storage ke request
 */
const setupSession = (app) => {
  app.use(cookieConfig);
  app.use(sessionConfig);
};

/**
 * Session Validation Middleware
 * Memastikan session valid dan tidak expired
 */
const validateSession = (req, res, next) => {
  if (!req.sessionID) {
    return res.status(401).json({
      success: false,
      message: 'Session not found'
    });
  }

  // Update session activity timestamp
  req.session.lastActivity = Date.now();
  
  next();
};

/**
 * Cookie Security Middleware
 * Menambahkan security headers untuk cookies
 */
const secureCookies = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
};

module.exports = {
  sessionConfig,
  cookieConfig,
  setupSession,
  validateSession,
  secureCookies
};
