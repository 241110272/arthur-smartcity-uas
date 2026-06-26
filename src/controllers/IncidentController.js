const IncidentReport = require('../models/IncidentReport');

const incidentModel = new IncidentReport();

/**
 * Incident Controller - Handle incident reports
 */
class IncidentController {
  /**
   * Get all incidents dengan pagination (async operation)
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, status = null } = req.query;

      let incidents;
      if (status) {
        incidents = await incidentModel.findAll('status = ?', [status]);
      } else {
        const paginatedResult = await incidentModel.getIncidentsWithPagination(parseInt(page), parseInt(limit));
        incidents = paginatedResult;
      }

      res.json({
        success: true,
        data: incidents
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incident by ID (async operation)
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const incident = await incidentModel.findById(id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: incident
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create incident report (async operation)
   */
  static async create(req, res, next) {
    try {
      const { title, description, incident_type, location, severity } = req.body;

      if (!title || !description || !incident_type || !location) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, incident type, dan location harus diisi'
        });
      }

      const result = await incidentModel.createReport({
        user_id: req.user.userId,
        title,
        description,
        incident_type,
        location,
        severity: severity || 'medium',
        image_url: null
      });

      res.status(201).json({
        success: true,
        message: 'Incident report berhasil dibuat',
        data: {
          id: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update incident status (async operation)
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status harus diisi'
        });
      }

      const incident = await incidentModel.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident tidak ditemukan'
        });
      }

      await incidentModel.updateStatus(id, status, notes);

      res.json({
        success: true,
        message: 'Status incident berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incidents by severity (async operation)
   */
  static async getBySeverity(req, res, next) {
    try {
      const { severity } = req.params;

      const incidents = await incidentModel.getIncidentsBySeverity(severity);

      res.json({
        success: true,
        data: incidents
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incidents by type (async operation)
   */
  static async getByType(req, res, next) {
    try {
      const { type } = req.params;

      const incidents = await incidentModel.getIncidentsByType(type);

      res.json({
        success: true,
        data: incidents
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete incident (async operation)
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const incident = await incidentModel.findById(id);
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident tidak ditemukan'
        });
      }

      await incidentModel.delete(id);

      res.json({
        success: true,
        message: 'Incident berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IncidentController;
