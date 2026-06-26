const AirQualityMonitoring = require('../models/AirQualityMonitoring');
const airQualityModel = new AirQualityMonitoring();

/**
 * Air Quality Monitoring Controller
 * Handle air quality monitoring dan alerts
 */
class AirQualityController {
  /**
   * Record air quality data
   */
  static async recordAirQuality(req, res, next) {
    try {
      const {
        location_name,
        latitude,
        longitude,
        aqi,
        pm2_5,
        pm10,
        o3,
        no2,
        so2,
        co,
        quality_level
      } = req.body;

      if (!location_name || !latitude || !longitude || aqi === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Location dan air quality index harus diisi'
        });
      }

      const result = await airQualityModel.recordAirQualityData({
        location_name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        aqi: parseInt(aqi),
        pm2_5: parseFloat(pm2_5) || null,
        pm10: parseFloat(pm10) || null,
        o3: parseFloat(o3) || null,
        no2: parseFloat(no2) || null,
        so2: parseFloat(so2) || null,
        co: parseFloat(co) || null,
        quality_level: quality_level || 'Moderate'
      });

      // Check dan create alerts jika diperlukan
      await airQualityModel.checkAndCreateAlerts();

      res.status(201).json({
        success: true,
        message: 'Data kualitas udara berhasil direkam',
        data: {
          recordId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest air quality data
   */
  static async getLatestAirQuality(req, res, next) {
    try {
      const airQualityData = await airQualityModel.getLatestAirQuality();

      res.json({
        success: true,
        data: airQualityData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unhealthy locations (public access)
   */
  static async getUnhealthyLocations(req, res, next) {
    try {
      const locations = await airQualityModel.getUnhealthyLocations();

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get air quality trend untuk lokasi
   */
  static async getAirQualityTrend(req, res, next) {
    try {
      const { location } = req.params;
      const { days = 7 } = req.query;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location parameter diperlukan'
        });
      }

      const trend = await airQualityModel.getAirQualityTrend(location, parseInt(days));

      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze correlation antara traffic dan air quality
   */
  static async analyzeTrafficAirCorrelation(req, res, next) {
    try {
      const { days = 7 } = req.query;

      const correlation = await airQualityModel.analyzeTrafficAirCorrelation(parseInt(days));

      res.json({
        success: true,
        message: 'Analisis korelasi traffic dan air quality',
        data: correlation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get air quality statistics
   */
  static async getStatistics(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const statistics = await airQualityModel.getAirQualityStatistics(parseInt(days));

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate air quality report (admin only)
   */
  static async generateReport(req, res, next) {
    try {
      const { days = 30, format = 'json' } = req.query;

      const statistics = await airQualityModel.getAirQualityStatistics(parseInt(days));
      const unhealthy = await airQualityModel.getUnhealthyLocations();
      const correlation = await airQualityModel.analyzeTrafficAirCorrelation(parseInt(days));

      const report = {
        generated_at: new Date(),
        period_days: parseInt(days),
        summary: statistics,
        unhealthy_locations: unhealthy,
        traffic_correlation: correlation
      };

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check air quality alerts
   */
  static async checkAlerts(req, res, next) {
    try {
      const alerts = await airQualityModel.checkAndCreateAlerts();

      res.json({
        success: true,
        message: 'Air quality alerts telah diperiksa',
        data: {
          new_alerts_created: alerts.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AirQualityController;
