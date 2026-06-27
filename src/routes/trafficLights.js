const express = require('express');
const router = express.Router();
const TrafficLightController = require('../controllers/TrafficLightController');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * Traffic Light Routes
 * Endpoints untuk traffic light management
 */

// GET - Get all traffic lights
router.get('/', (req, res, next) => {
  TrafficLightController.getAll(req, res, next);
});

// GET - Get current traffic conditions
router.get('/current/conditions', (req, res, next) => {
  TrafficLightController.getCurrentConditions(req, res, next);
});

// GET - Get traffic light by ID
router.get('/:id', (req, res, next) => {
  TrafficLightController.getById(req, res, next);
});

// POST - Create new traffic light (admin only)
router.post('/', authMiddleware, authorize('admin'), (req, res, next) => {
  TrafficLightController.create(req, res, next);
});

// PUT - Update traffic light status (admin only)
router.put('/:id/status', authMiddleware, authorize('admin'), (req, res, next) => {
  TrafficLightController.updateStatus(req, res, next);
});

// POST - Automate traffic light (admin only)
router.post('/:id/automate', authMiddleware, authorize('admin'), (req, res, next) => {
  TrafficLightController.automate(req, res, next);
});

// GET - Get traffic statistics
router.get('/:id/statistics', (req, res, next) => {
  TrafficLightController.getStatistics(req, res, next);
});

// POST - Record traffic data
router.post('/:id/record', authMiddleware, (req, res, next) => {
  TrafficLightController.recordData(req, res, next);
});

// GET - Get peak traffic times
router.get('/:id/peak-times', (req, res, next) => {
  TrafficLightController.getPeakTimes(req, res, next);
});

// DELETE - Delete traffic light (admin only)
router.delete('/:id', authMiddleware, authorize('admin'), (req, res, next) => {
  TrafficLightController.delete(req, res, next);
});

module.exports = router;
