const EmergencyAlert = require('../models/EmergencyAlert');
const emergencyModel = new EmergencyAlert();

/**
 * Emergency Alert Controller
 * Handle emergency alerts dan emergency vehicle prioritization
 */
class EmergencyAlertController {
  /**
   * Create emergency alert
   */
  static async createAlert(req, res, next) {
    try {
      const {
        alert_type,
        severity,
        location_name,
        latitude,
        longitude,
        description
      } = req.body;

      if (!alert_type || !location_name || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Alert type, location, dan koordinat harus diisi'
        });
      }

      const result = await emergencyModel.createAlert({
        alert_type,
        severity: severity || 'medium',
        location_name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description || '',
        created_by: req.user?.userId || req.user?.id || 1
      });

      // Broadcast alert ke connected systems via Socket.IO
      req.app.get('io').emit('emergency_alert_created', {
        alertId: result.insertId,
        alert_type,
        severity,
        location_name
      });

      res.status(201).json({
        success: true,
        message: 'Emergency alert berhasil dibuat',
        data: {
          alertId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active alerts
   */
  static async getActiveAlerts(req, res, next) {
    try {
      const alerts = await emergencyModel.getActiveAlerts();

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get critical alerts (admin/superadmin only)
   */
  static async getCriticalAlerts(req, res, next) {
    try {
      const alerts = await emergencyModel.getCriticalAlerts();

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get alerts by type
   */
  static async getAlertsByType(req, res, next) {
    try {
      const { type } = req.params;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Alert type parameter diperlukan'
        });
      }

      const alerts = await emergencyModel.getAlertsByType(type);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update alert status
   */
  static async updateAlertStatus(req, res, next) {
    try {
      const { alertId } = req.params;
      const { status, resolvedAt } = req.body;

      if (!alertId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Alert ID dan status harus diisi'
        });
      }

      const result = await emergencyModel.updateAlertStatus(
        alertId,
        status,
        resolvedAt
      );

      res.json({
        success: true,
        message: 'Status alert berhasil diperbarui',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get alerts near location
   */
  static async getAlertsNearLocation(req, res, next) {
    try {
      const { latitude, longitude, radius = 5 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude dan longitude harus diisi'
        });
      }

      const alerts = await emergencyModel.getAlertsNearLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Emergency vehicle priority request
   */
  static async prioritizeEmergencyVehicle(req, res, next) {
    try {
      const {
        vehicle_type, // ambulance, fire, police
        location_name,
        latitude,
        longitude,
        description
      } = req.body;

      if (!vehicle_type || !location_name) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type dan location harus diisi'
        });
      }

      // Create alert untuk emergency vehicle
      const result = await emergencyModel.createAlert({
        alert_type: 'emergency_vehicle',
        severity: 'critical',
        location_name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: `${vehicle_type.toUpperCase()} priority request: ${description || ''}`,
        created_by: req.user?.userId || req.user?.id || 1
      });

      // Broadcast ke traffic management system untuk prioritize traffic lights
      req.app.get('io').emit('emergency_vehicle_priority', {
        alertId: result.insertId,
        vehicle_type,
        location_name,
        latitude,
        longitude
      });

      res.status(201).json({
        success: true,
        message: 'Emergency vehicle priority request dibuat',
        data: {
          alertId: result.insertId,
          vehicle_type,
          location_name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get emergency vehicle response history (admin only)
   */
  static async getEmergencyHistory(req, res, next) {
    try {
      const history = await emergencyModel.getEmergencyVehicleAlerts();

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmergencyAlertController;
