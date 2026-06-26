const express = require('express');
const router = express.Router();
const EmergencyAlertController = require('../controllers/EmergencyAlertController');
const { authenticateJWT, isAdmin, isSuperAdmin, isUser } = require('../middleware/auth.middleware');

/**
 * Emergency Alert Routes
 * /api/emergency-alerts/*
 */

// Public routes - anyone dapat membaca active alerts
router.get('/active', isUser, EmergencyAlertController.getActiveAlerts);
router.get('/type/:type', isUser, EmergencyAlertController.getAlertsByType);
router.get('/near', isUser, EmergencyAlertController.getAlertsNearLocation);

// User routes - dapat membuat alert dan prioritas emergency
router.post('/create', isUser, EmergencyAlertController.createAlert);
router.post('/emergency-vehicle', isUser, EmergencyAlertController.prioritizeEmergencyVehicle);

// Admin routes
router.get('/admin/critical', isAdmin, EmergencyAlertController.getCriticalAlerts);
router.get('/admin/history', isAdmin, EmergencyAlertController.getEmergencyHistory);
router.put('/:alertId/status', isAdmin, EmergencyAlertController.updateAlertStatus);

module.exports = router;
