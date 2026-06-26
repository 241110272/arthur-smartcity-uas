const express = require('express');
const router = express.Router();
const PedestrianController = require('../controllers/PedestrianController');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * Pedestrian Crossing Routes
 * Endpoints untuk pedestrian crossing management
 */

// GET - Get all pedestrian crossings
router.get('/', (req, res, next) => {
  PedestrianController.getAll(req, res, next);
});

// GET - Get pedestrian crossing by ID
router.get('/:id', (req, res, next) => {
  PedestrianController.getById(req, res, next);
});

// POST - Create new pedestrian crossing (admin only)
router.post('/', authMiddleware, authorize('admin'), (req, res, next) => {
  PedestrianController.create(req, res, next);
});

// PUT - Update pedestrian crossing signal (admin only)
router.put('/:id/signal', authMiddleware, authorize('admin'), (req, res, next) => {
  PedestrianController.updateSignal(req, res, next);
});

// POST - Record pedestrian activity
router.post('/:id/record', authMiddleware, (req, res, next) => {
  PedestrianController.recordActivity(req, res, next);
});

// GET - Get pedestrian statistics
router.get('/:id/statistics', (req, res, next) => {
  PedestrianController.getStatistics(req, res, next);
});

// PUT - Update pedestrian crossing (admin only)
router.put('/:id', authMiddleware, authorize('admin'), (req, res, next) => {
  PedestrianController.update(req, res, next);
});

// DELETE - Delete pedestrian crossing (admin only)
router.delete('/:id', authMiddleware, authorize('admin'), (req, res, next) => {
  PedestrianController.delete(req, res, next);
});

module.exports = router;
