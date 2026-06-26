const BaseModel = require('./BaseModel');
const pool = require('../utils/database');

/**
 * PedestrianCrossing Model - Extends BaseModel
 * Manages pedestrian crossing data dan operations
 */
class PedestrianCrossing extends BaseModel {
  constructor() {
    super('pedestrian_crossings');
  }

  /**
   * Get all pedestrian crossings dengan status
   */
  async getAllWithStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT pc.*, 
                (SELECT COUNT(*) FROM pedestrian_activity WHERE crossing_id = pc.id AND DATE(created_at) = CURDATE()) as total_pedestrians,
                (SELECT AVG(wait_time) FROM pedestrian_activity WHERE crossing_id = pc.id AND DATE(created_at) = CURDATE()) as avg_wait_time
         FROM ${this.tableName} pc 
         ORDER BY pc.location_name ASC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Update crossing signal status (async operation)
   */
  async updateSignal(crossingId, signal, waitTime) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE ${this.tableName} SET current_signal = ?, wait_time_estimate = ?, last_updated = NOW() WHERE id = ?`,
        [signal, waitTime, crossingId]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Get crossing berdasarkan location
   */
  async getByLocation(locationName) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE location_name = ?`,
        [locationName]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Record pedestrian activity (async operation)
   */
  async recordPedestrianActivity(crossingId, count, waitTime) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO pedestrian_activity (crossing_id, pedestrian_count, wait_time, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [crossingId, count, waitTime]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Get pedestrian statistics untuk crossing tertentu
   */
  async getPedestrianStats(crossingId, days = 7) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT DATE(created_at) as date, SUM(pedestrian_count) as total_count, AVG(wait_time) as avg_wait 
         FROM pedestrian_activity 
         WHERE crossing_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [crossingId, days]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = PedestrianCrossing;
