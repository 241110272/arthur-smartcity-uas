/**
 * Request Validation Middleware
 */
const validateRequest = (req, res, next) => {
  // Set request ID untuk logging
  req.requestId = Date.now() + Math.random().toString(36).substr(2, 9);
  
  // Sanitasi input
  req.body = sanitizeInput(req.body);
  
  next();
};

/**
 * Helper function untuk sanitasi input
 * Password fields dikecualikan agar hash bcrypt tidak rusak
 */
const SKIP_SANITIZE_FIELDS = ['password', 'confirmPassword', 'oldPassword', 'newPassword'];

function sanitizeInput(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInput(item));
  }

  const sanitized = {};
  for (const key in obj) {
    const value = obj[key];

    // Skip sanitasi untuk field password agar tidak merusak hash
    if (SKIP_SANITIZE_FIELDS.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    
    if (typeof value === 'string') {
      // Basic string trim without removing valid punctuation
      // (SQL injection is prevented by parameterized queries in DatabaseUtil)
      sanitized[key] = value.trim();
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logger Middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });

  next();
};

module.exports = {
  validateRequest,
  logger,
  sanitizeInput
};
