const TrafficLight = require('../models/TrafficLight');
const TrafficData = require('../models/TrafficData');

const trafficLightModel = new TrafficLight();
const trafficDataModel = new TrafficData();

/**
 * Traffic Light Controller - Handle traffic light operations
 */
class TrafficLightController {
  /**
   * Get all traffic lights (async operation)
   */
  static async getAll(req, res, next) {
    try {
      const trafficLights = await trafficLightModel.getAllWithStatus();
      
      res.json({
        success: true,
        data: trafficLights
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get traffic light by ID (async operation)
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const trafficLight = await trafficLightModel.findById(id);

      if (!trafficLight) {
        return res.status(404).json({
          success: false,
          message: 'Traffic light tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: trafficLight
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create traffic light (async operation)
   */
  static async create(req, res, next) {
    try {
      const { intersection_name, location, latitude, longitude, current_status, status_duration } = req.body;

      if (!intersection_name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Nama interseksi dan lokasi harus diisi'
        });
      }

      const result = await trafficLightModel.create({
        intersection_name,
        location,
        latitude,
        longitude,
        current_status: current_status || 'red',
        status_duration: status_duration || 30,
        created_at: new Date(),
        updated_at: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Traffic light berhasil ditambahkan',
        data: {
          id: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update traffic light status (async operation)
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, duration } = req.body;

      if (!status || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Status dan durasi harus diisi'
        });
      }

      const trafficLight = await trafficLightModel.findById(id);
      if (!trafficLight) {
        return res.status(404).json({
          success: false,
          message: 'Traffic light tidak ditemukan'
        });
      }

      await trafficLightModel.updateStatus(id, status, duration);

      res.json({
        success: true,
        message: 'Status traffic light berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Automate traffic light based on vehicle density (async operation)
   */
  static async automate(req, res, next) {
    try {
      const { id } = req.params;

      const trafficLight = await trafficLightModel.findById(id);
      if (!trafficLight) {
        return res.status(404).json({
          success: false,
          message: 'Traffic light tidak ditemukan'
        });
      }

      const result = await trafficLightModel.automateTrafficLight(id);

      res.json({
        success: true,
        message: 'Traffic light berhasil di-automate',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get traffic statistics (async operation)
   */
  static async getStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const { hours = 24 } = req.query;

      const trafficLight = await trafficLightModel.findById(id);
      if (!trafficLight) {
        return res.status(404).json({
          success: false,
          message: 'Traffic light tidak ditemukan'
        });
      }

      const stats = await trafficDataModel.getTrafficStats(id, hours);

      res.json({
        success: true,
        data: {
          intersection: trafficLight.intersection_name,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record traffic data (async operation)
   */
  static async recordData(req, res, next) {
    try {
      const { id } = req.params;
      const { vehicleCount, averageSpeed } = req.body;

      if (vehicleCount === undefined || averageSpeed === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle count dan average speed harus diisi'
        });
      }

      await trafficDataModel.recordTraffic(id, vehicleCount, averageSpeed);

      res.json({
        success: true,
        message: 'Data traffic berhasil dicatat'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current traffic conditions (async operation)
   */
  static async getCurrentConditions(req, res, next) {
    try {
      const conditions = await trafficDataModel.getCurrentTrafficConditions();

      res.json({
        success: true,
        data: conditions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get peak traffic times (async operation)
   */
  static async getPeakTimes(req, res, next) {
    try {
      const { id } = req.params;
      const { days = 7 } = req.query;

      const peakTimes = await trafficDataModel.getPeakTrafficTimes(id, days);

      res.json({
        success: true,
        data: peakTimes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete traffic light (async operation)
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const trafficLight = await trafficLightModel.findById(id);
      if (!trafficLight) {
        return res.status(404).json({
          success: false,
          message: 'Traffic light tidak ditemukan'
        });
      }

      await trafficLightModel.delete(id);

      res.json({
        success: true,
        message: 'Traffic light berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TrafficLightController;
