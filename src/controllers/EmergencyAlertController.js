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
        type,
        severity,
        location_name,
        location,
        latitude,
        longitude,
        lat,
        lng,
        description
      } = req.body;

      const normalizedAlertType = alert_type || type;
      const normalizedLocation = location_name || location;
      const normalizedLatitude = latitude ?? lat;
      const normalizedLongitude = longitude ?? lng;

      if (!normalizedAlertType || !normalizedLocation || normalizedLatitude === undefined || normalizedLatitude === null || normalizedLatitude === '' || normalizedLongitude === undefined || normalizedLongitude === null || normalizedLongitude === '') {
        return res.status(400).json({
          success: false,
          message: 'Alert type, location, dan koordinat harus diisi'
        });
      }

      const result = await emergencyModel.createAlert({
        alert_type: normalizedAlertType,
        severity: severity || 'medium',
        location_name: normalizedLocation,
        latitude: parseFloat(normalizedLatitude),
        longitude: parseFloat(normalizedLongitude),
        description: description || '',
        created_by: req.user?.userId || req.user?.id || 1
      });

      // Broadcast alert ke connected systems via Socket.IO
      req.app.get('io')?.emit('emergency_alert_created', {
        alertId: result.insertId,
        alert_type: normalizedAlertType,
        severity,
        location_name: normalizedLocation
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
        location,
        latitude,
        longitude,
        lat,
        lng,
        description
      } = req.body;

      const normalizedLocation = location_name || location;
      const normalizedLatitude = latitude ?? lat;
      const normalizedLongitude = longitude ?? lng;

      if (!vehicle_type || !normalizedLocation) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type dan location harus diisi'
        });
      }

      // Create alert untuk emergency vehicle
      const result = await emergencyModel.createAlert({
        alert_type: 'emergency_vehicle',
        severity: 'critical',
        location_name: normalizedLocation,
        latitude: parseFloat(normalizedLatitude ?? 0),
        longitude: parseFloat(normalizedLongitude ?? 0),
        description: `${vehicle_type.toUpperCase()} priority request: ${description || ''}`,
        created_by: req.user?.userId || req.user?.id || 1
      });

      // Broadcast ke traffic management system untuk prioritize traffic lights
      req.app.get('io')?.emit('emergency_vehicle_priority', {
        alertId: result.insertId,
        vehicle_type,
        location_name: normalizedLocation,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude
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
