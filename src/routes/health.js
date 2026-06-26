const express = require('express');
const router = express.Router();

/**
 * Health Check Route
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City Traffic Management System is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
