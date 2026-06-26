const express = require('express');
const router = express.Router();
const IncidentController = require('../controllers/IncidentController');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * Incident Report Routes
 * Endpoints untuk incident management
 */

// GET - Get all incidents
router.get('/', (req, res, next) => {
  IncidentController.getAll(req, res, next);
});

// GET - Get incident by ID
router.get('/:id', (req, res, next) => {
  IncidentController.getById(req, res, next);
});

// POST - Create new incident report (require auth)
router.post('/', authMiddleware, (req, res, next) => {
  IncidentController.create(req, res, next);
});

// PUT - Update incident status (admin only)
router.put('/:id/status', authMiddleware, authorize('admin'), (req, res, next) => {
  IncidentController.updateStatus(req, res, next);
});

// GET - Get incidents by severity
router.get('/severity/:severity', (req, res, next) => {
  IncidentController.getBySeverity(req, res, next);
});

// GET - Get incidents by type
router.get('/type/:type', (req, res, next) => {
  IncidentController.getByType(req, res, next);
});

// DELETE - Delete incident (admin only)
router.delete('/:id', authMiddleware, authorize('admin'), (req, res, next) => {
  IncidentController.delete(req, res, next);
});

module.exports = router;
