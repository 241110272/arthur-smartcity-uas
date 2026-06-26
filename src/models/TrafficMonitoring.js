const BaseModel = require('./BaseModel');
const DatabaseUtil = require('../utils/database.util');

/**
 * Traffic Monitoring Model
 * Melacak kondisi lalu lintas real-time di berbagai lokasi
 */
class TrafficMonitoring extends BaseModel {
  constructor() {
    super('traffic_monitoring');
  }

  /**
   * Record traffic data untuk lokasi tertentu
   */
  async recordTrafficData(data) {
    const {
      location_name,
      latitude,
      longitude,
      congestion_level, // low, medium, high, critical
      vehicle_count,
      average_speed,
      recorded_by // user_id
    } = data;

    const insertData = {
      location_name,
      latitude,
      longitude,
      congestion_level,
      vehicle_count,
      average_speed,
      recorded_by,
      recorded_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(insertData);
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get latest traffic data untuk semua lokasi
   */
  async getLatestTrafficData() {
    const query = `
      SELECT 
        t.*,
        u.username as recorded_by_name
      FROM ${this.tableName} t
      LEFT JOIN users u ON t.recorded_by = u.id
      WHERE t.recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY t.location_name, t.recorded_at DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get traffic data untuk lokasi spesifik
   */
  async getTrafficByLocation(locationName) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE location_name = ?
      AND recorded_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY recorded_at DESC
      LIMIT 100
    `;
    return await DatabaseUtil.executeSelect(query, [locationName]);
  }

  /**
   * Get high congestion locations
   */
  async getHighCongestionLocations() {
    const query = `
      SELECT 
        location_name,
        ANY_VALUE(latitude) as latitude,
        ANY_VALUE(longitude) as longitude,
        ANY_VALUE(congestion_level) as congestion_level,
        ANY_VALUE(vehicle_count) as vehicle_count,
        ANY_VALUE(average_speed) as average_speed,
        MAX(recorded_at) as last_updated
      FROM ${this.tableName}
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND congestion_level IN ('high', 'critical')
      GROUP BY location_name
      ORDER BY congestion_level DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get traffic statistics
   */
  async getTrafficStatistics(days = 7) {
    const query = `
      SELECT 
        location_name,
        AVG(vehicle_count) as avg_vehicles,
        MAX(vehicle_count) as peak_vehicles,
        AVG(average_speed) as avg_speed,
        COUNT(DISTINCT DATE(recorded_at)) as monitoring_days
      FROM ${this.tableName}
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY location_name
      ORDER BY avg_vehicles DESC
    `;
    return await DatabaseUtil.executeSelect(query, [days]);
  }

  /**
   * Get traffic pattern trend by hour of day
   */
  async getTrafficPatternTrend(days = 7) {
    const query = `
      SELECT 
        HOUR(recorded_at) as hour_of_day,
        AVG(vehicle_count) as avg_vehicles,
        AVG(average_speed) as avg_speed,
        COUNT(*) as data_points
      FROM ${this.tableName}
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY HOUR(recorded_at)
      ORDER BY hour_of_day ASC
    `;
    return await DatabaseUtil.executeSelect(query, [days]);
  }
}

module.exports = TrafficMonitoring;
