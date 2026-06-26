const express = require('express');
const router = express.Router();
const PublicTransportationController = require('../controllers/PublicTransportationController');
const { authenticateJWT, isAdmin, isUser } = require('../middleware/auth.middleware');

/**
 * Public Transportation Routes
 * /api/public-transportation/*
 */

// Public routes - siapa saja dapat melihat transportasi
router.get('/active', PublicTransportationController.getActiveTransportation);
router.get('/route/:route', PublicTransportationController.getTransportationByRoute);
router.get('/near', PublicTransportationController.getTransportationNear);
router.get('/routes', PublicTransportationController.getAllRoutes);
router.get('/statistics', PublicTransportationController.getStatistics);
router.get('/route-stats/:route', PublicTransportationController.getRouteStatistics);

// User routes - dapat merekam issue dan update lokasi
router.post('/register', isUser, PublicTransportationController.registerTransport);
router.put('/:transportId/location', isUser, PublicTransportationController.updateLocation);
router.post('/report-issue', isUser, PublicTransportationController.reportIssue);

// Admin routes
router.get('/admin/issues', isAdmin, PublicTransportationController.getActiveIssues);

module.exports = router;
