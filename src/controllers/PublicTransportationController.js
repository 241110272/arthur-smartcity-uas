const PublicTransportation = require('../models/PublicTransportation');
const transportModel = new PublicTransportation();

/**
 * Public Transportation Controller
 * Handle public transportation management
 */
class PublicTransportationController {
  /**
   * Register new transportation
   */
  static async registerTransport(req, res, next) {
    try {
      const {
        vehicle_type,
        vehicle_number,
        route_name,
        current_location_lat,
        current_location_lng,
        occupancy_rate
      } = req.body;

      if (!vehicle_type || !vehicle_number || !route_name) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type, number, dan route name harus diisi'
        });
      }

      const result = await transportModel.registerTransport({
        vehicle_type,
        vehicle_number,
        route_name,
        current_location_lat: parseFloat(current_location_lat) || 0,
        current_location_lng: parseFloat(current_location_lng) || 0,
        occupancy_rate: parseInt(occupancy_rate) || 0,
        status: 'in_service',
        operator_id: req.user?.userId || req.user?.id || 1
      });

      res.status(201).json({
        success: true,
        message: 'Transportasi berhasil didaftarkan',
        data: {
          transportId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update real-time location
   */
  static async updateLocation(req, res, next) {
    try {
      const { transportId } = req.params;
      const { latitude, longitude, occupancy_rate } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude dan longitude harus diisi'
        });
      }

      await transportModel.updateLocation(
        transportId,
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(occupancy_rate) || 0
      );

      // Broadcast real-time update
      req.app.get('io').emit('transport_location_update', {
        transportId,
        latitude,
        longitude,
        occupancy_rate
      });

      res.json({
        success: true,
        message: 'Lokasi transportasi berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active transportation
   */
  static async getActiveTransportation(req, res, next) {
    try {
      const transports = await transportModel.getActiveTransportation();

      res.json({
        success: true,
        data: transports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transportation by route
   */
  static async getTransportationByRoute(req, res, next) {
    try {
      const { route } = req.params;

      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route parameter diperlukan'
        });
      }

      const transports = await transportModel.getTransportationByRoute(route);

      res.json({
        success: true,
        data: transports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transportation near location
   */
  static async getTransportationNear(req, res, next) {
    try {
      const { latitude, longitude, radius = 2 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude dan longitude harus diisi'
        });
      }

      const transports = await transportModel.getTransportationNearLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      res.json({
        success: true,
        data: transports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transportation statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const statistics = await transportModel.getTransportationStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route statistics
   */
  static async getRouteStatistics(req, res, next) {
    try {
      const { route } = req.params;

      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route parameter diperlukan'
        });
      }

      const statistics = await transportModel.getRouteStatistics(route);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all available routes
   */
  static async getAllRoutes(req, res, next) {
    try {
      const routes = await transportModel.getAllRoutes();

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Report transportation issue
   */
  static async reportIssue(req, res, next) {
    try {
      const {
        transport_id,
        issue_type,
        description
      } = req.body;

      if (!transport_id || !issue_type) {
        return res.status(400).json({
          success: false,
          message: 'Transport ID dan issue type harus diisi'
        });
      }

      const result = await transportModel.reportTransportationIssue(
        transport_id,
        issue_type,
        description || '',
        req.user?.userId || req.user?.id || 1
      );

      res.status(201).json({
        success: true,
        message: 'Laporan masalah transportasi berhasil dibuat',
        data: {
          issueId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active transportation issues
   */
  static async getActiveIssues(req, res, next) {
    try {
      const issues = await transportModel.getActiveTransportationIssues();

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PublicTransportationController;
