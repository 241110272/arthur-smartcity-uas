const express = require('express');
const router = express.Router();
const TrafficMonitoringController = require('../controllers/TrafficMonitoringController');
const { authenticateJWT, isAdmin, isUser } = require('../middleware/auth.middleware');

/**
 * Traffic Monitoring Routes
 * /api/traffic-monitoring/*
 */

// Public routes
router.get('/latest', isUser, TrafficMonitoringController.getLatestTraffic);
router.get('/location/:location', isUser, TrafficMonitoringController.getTrafficByLocation);
router.get('/congestion', isUser, TrafficMonitoringController.getHighCongestion);
router.get('/statistics', isUser, TrafficMonitoringController.getStatistics);

// User routes - dapat merekam data
router.post('/record', isUser, TrafficMonitoringController.recordTraffic);

// Admin routes
router.get('/admin/report', isAdmin, TrafficMonitoringController.generateReport);

module.exports = router;
