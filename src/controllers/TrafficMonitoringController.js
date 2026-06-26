const TrafficMonitoring = require('../models/TrafficMonitoring');
const trafficModel = new TrafficMonitoring();

/**
 * Traffic Monitoring Controller
 * Handle real-time traffic data operations
 */
class TrafficMonitoringController {
  /**
   * Record traffic data untuk lokasi
   */
  static async recordTraffic(req, res, next) {
    try {
      const {
        location_name,
        latitude,
        longitude,
        congestion_level,
        vehicle_count,
        average_speed
      } = req.body;

      if (!location_name || !latitude || !longitude || !congestion_level) {
        return res.status(400).json({
          success: false,
          message: 'Location dan traffic data harus lengkap'
        });
      }

      const result = await trafficModel.recordTrafficData({
        location_name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        congestion_level,
        vehicle_count: parseInt(vehicle_count) || 0,
        average_speed: parseFloat(average_speed) || 0,
        recorded_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Data lalu lintas berhasil direkam',
        data: {
          trafficId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest traffic data
   */
  static async getLatestTraffic(req, res, next) {
    try {
      const trafficData = await trafficModel.getLatestTrafficData();

      res.json({
        success: true,
        data: trafficData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get traffic by location
   */
  static async getTrafficByLocation(req, res, next) {
    try {
      const { location } = req.params;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location parameter diperlukan'
        });
      }

      const trafficData = await trafficModel.getTrafficByLocation(location);

      res.json({
        success: true,
        data: trafficData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get high congestion locations
   */
  static async getHighCongestion(req, res, next) {
    try {
      const congestionData = await trafficModel.getHighCongestionLocations();

      res.json({
        success: true,
        data: congestionData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get traffic statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const statistics = await trafficModel.getTrafficStatistics(parseInt(days));

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get traffic pattern (hourly trend)
   */
  static async getPattern(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const patternData = await trafficModel.getTrafficPatternTrend(parseInt(days));

      res.json({
        success: true,
        data: patternData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate traffic report (admin only)
   */
  static async generateReport(req, res, next) {
    try {
      const { days = 30, format = 'json' } = req.query;
      
      const statistics = await trafficModel.getTrafficStatistics(parseInt(days));
      const congestionData = await trafficModel.getHighCongestionLocations();

      const report = {
        generated_at: new Date(),
        period_days: parseInt(days),
        summary: statistics,
        current_congestion: congestionData
      };

      if (format === 'csv') {
        // Convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=traffic_report.csv');
        // CSV generation logic here
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TrafficMonitoringController;
