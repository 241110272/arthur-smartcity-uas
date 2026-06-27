const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateJWT, isAdmin, authorize } = require('../middleware/auth.middleware');

/**
 * Auth Routes
 * Endpoints untuk authentication operations
 */

// POST - Register user baru
router.post('/register', (req, res, next) => {
  AuthController.register(req, res, next);
});

// POST - Login user
router.post('/login', (req, res, next) => {
  AuthController.login(req, res, next);
});

// GET - Get current user (require auth)
router.get('/me', authenticateJWT, (req, res, next) => {
  AuthController.getCurrentUser(req, res, next);
});

// GET - Get all users (admin only)
router.get('/users', authenticateJWT, isAdmin, (req, res, next) => {
  AuthController.getAllUsers(req, res, next);
});

// POST - Update password (require auth)
router.post('/change-password', authMiddleware, (req, res, next) => {
  AuthController.updatePassword(req, res, next);
});

module.exports = router;
