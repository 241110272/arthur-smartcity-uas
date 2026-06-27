const express = require('express');
const router = express.Router();
const AirQualityController = require('../controllers/AirQualityController');
const { authenticateJWT, isAdmin, isUser } = require('../middleware/auth');

/**
 * Air Quality Monitoring Routes
 * /api/air-quality/*
 */

// Public routes - siapa saja dapat melihat air quality
router.get('/latest', AirQualityController.getLatestAirQuality);
router.get('/unhealthy', AirQualityController.getUnhealthyLocations);
router.get('/trend/:location', AirQualityController.getAirQualityTrend);
router.get('/statistics', AirQualityController.getStatistics);

// User routes - dapat merekam data
router.post('/record', isUser, AirQualityController.recordAirQuality);

// Admin routes
router.get('/admin/correlation', isAdmin, AirQualityController.analyzeTrafficAirCorrelation);
router.get('/admin/report', isAdmin, AirQualityController.generateReport);
router.put('/admin/update/:id', isAdmin, AirQualityController.updateAirQuality);
router.post('/admin/check-alerts', isAdmin, AirQualityController.checkAlerts);

module.exports = router;
