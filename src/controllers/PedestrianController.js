const PedestrianCrossing = require('../models/PedestrianCrossing');

const pedestrianCrossingModel = new PedestrianCrossing();

/**
 * Pedestrian Crossing Controller - Handle pedestrian operations
 */
class PedestrianController {
  /**
   * Get all pedestrian crossings (async operation)
   */
  static async getAll(req, res, next) {
    try {
      const crossings = await pedestrianCrossingModel.getAllWithStats();
      
      res.json({
        success: true,
        data: crossings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pedestrian crossing by ID (async operation)
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const crossing = await pedestrianCrossingModel.findById(id);

      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: crossing
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create pedestrian crossing (async operation)
   */
  static async create(req, res, next) {
    try {
      const { location_name, street_name, latitude, longitude, current_signal, wait_time_estimate } = req.body;

      if (!location_name || !street_name) {
        return res.status(400).json({
          success: false,
          message: 'Nama lokasi dan nama jalan harus diisi'
        });
      }

      const result = await pedestrianCrossingModel.create({
        location_name,
        street_name,
        latitude,
        longitude,
        current_signal: current_signal || 'wait',
        wait_time_estimate: wait_time_estimate || 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Pedestrian crossing berhasil ditambahkan',
        data: {
          id: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update pedestrian crossing signal (async operation)
   */
  static async updateSignal(req, res, next) {
    try {
      const { id } = req.params;
      const { signal, waitTime } = req.body;

      if (!signal || waitTime === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Signal dan wait time harus diisi'
        });
      }

      const crossing = await pedestrianCrossingModel.findById(id);
      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      await pedestrianCrossingModel.updateSignal(id, signal, waitTime);

      res.json({
        success: true,
        message: 'Signal pedestrian crossing berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record pedestrian activity (async operation)
   */
  static async recordActivity(req, res, next) {
    try {
      const { id } = req.params;
      const { pedestrianCount, waitTime } = req.body;

      if (pedestrianCount === undefined || waitTime === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Pedestrian count dan wait time harus diisi'
        });
      }

      const crossing = await pedestrianCrossingModel.findById(id);
      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      await pedestrianCrossingModel.recordPedestrianActivity(id, pedestrianCount, waitTime);

      res.json({
        success: true,
        message: 'Aktivitas pedestrian berhasil dicatat'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pedestrian statistics (async operation)
   */
  static async getStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const { days = 7 } = req.query;

      const crossing = await pedestrianCrossingModel.findById(id);
      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      const stats = await pedestrianCrossingModel.getPedestrianStats(id, days);

      res.json({
        success: true,
        data: {
          location: crossing.location_name,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update pedestrian crossing (async operation)
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { location_name, street_name } = req.body;

      const crossing = await pedestrianCrossingModel.findById(id);
      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      await pedestrianCrossingModel.update(id, {
        location_name: location_name || crossing.location_name,
        street_name: street_name || crossing.street_name,
        updated_at: new Date()
      });

      res.json({
        success: true,
        message: 'Pedestrian crossing berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete pedestrian crossing (async operation)
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const crossing = await pedestrianCrossingModel.findById(id);
      if (!crossing) {
        return res.status(404).json({
          success: false,
          message: 'Pedestrian crossing tidak ditemukan'
        });
      }

      await pedestrianCrossingModel.delete(id);

      res.json({
        success: true,
        message: 'Pedestrian crossing berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PedestrianController;
