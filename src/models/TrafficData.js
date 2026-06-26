const pool = require('../utils/database');

/**
 * TrafficData Model - Extends BaseModel
 * Tracks real-time traffic data
 */
class TrafficData {
  constructor() {
    this.tableName = 'traffic_data';
  }

  /**
   * Record traffic data (async operation)
   */
  async recordTraffic(trafficLightId, vehicleCount, averageSpeed) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO ${this.tableName} (traffic_light_id, vehicle_count, average_speed, congestion_level, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [trafficLightId, vehicleCount, averageSpeed, this.calculateCongestionLevel(vehicleCount)]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Calculate congestion level based on vehicle count
   */
  calculateCongestionLevel(vehicleCount) {
    if (vehicleCount > 150) return 'high';
    if (vehicleCount > 75) return 'medium';
    return 'low';
  }

  /**
   * Get traffic statistics (async operation)
   */
  async getTrafficStats(trafficLightId, hours = 24) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT DATE_FORMAT(created_at, '%H:00') as hour, 
                AVG(vehicle_count) as avg_vehicles, 
                AVG(average_speed) as avg_speed,
                MAX(vehicle_count) as peak_vehicles
         FROM ${this.tableName}
         WHERE traffic_light_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
         GROUP BY DATE_FORMAT(created_at, '%H:00')
         ORDER BY hour DESC`,
        [trafficLightId, hours]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get current traffic conditions untuk semua intersections
   */
  async getCurrentTrafficConditions() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT td.*, tl.intersection_name, tl.current_status
         FROM ${this.tableName} td
         JOIN traffic_lights tl ON td.traffic_light_id = tl.id
         WHERE td.created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         ORDER BY tl.intersection_name ASC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get peak traffic times (async operation)
   */
  async getPeakTrafficTimes(trafficLightId, days = 7) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT DATE_FORMAT(created_at, '%H:00') as time, 
                AVG(vehicle_count) as avg_count
         FROM ${this.tableName}
         WHERE traffic_light_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE_FORMAT(created_at, '%H:00')
         ORDER BY avg_count DESC
         LIMIT 10`,
        [trafficLightId, days]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = TrafficData;
