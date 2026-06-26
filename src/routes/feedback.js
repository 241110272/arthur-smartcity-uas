const express = require('express');
const router = express.Router();
const CitizenFeedbackController = require('../controllers/CitizenFeedbackController');
const { authenticateJWT, isAdmin, isUser } = require('../middleware/auth.middleware');

/**
 * Citizen Feedback Routes
 * /api/feedback/*
 */

// Public routes - siapa saja dapat submit feedback
router.get('/', CitizenFeedbackController.getAllFeedback);
router.post('/submit', isUser, CitizenFeedbackController.submitFeedback);
router.get('/category/:category', CitizenFeedbackController.getFeedbackByCategory);
router.get('/location-stats', CitizenFeedbackController.getFeedbackByLocation);
router.get('/user/:userId', CitizenFeedbackController.getUserFeedbackHistory);
router.get('/:feedbackId', CitizenFeedbackController.getById);
router.get('/:feedbackId/responses', CitizenFeedbackController.getFeedbackWithResponses);

// Admin routes
router.get('/admin/open', isAdmin, CitizenFeedbackController.getOpenFeedback);
router.get('/admin/high-priority', isAdmin, CitizenFeedbackController.getHighPriorityFeedback);
router.get('/admin/statistics', isAdmin, CitizenFeedbackController.getStatistics);
router.get('/admin/report', isAdmin, CitizenFeedbackController.generateReport);
router.put('/:feedbackId/status', isAdmin, CitizenFeedbackController.updateFeedbackStatus);
router.post('/:feedbackId/response', isAdmin, CitizenFeedbackController.addAdminResponse);

module.exports = router;
