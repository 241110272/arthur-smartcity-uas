const BaseModel = require('./BaseModel');

/**
 * TrafficLight Model - Extends BaseModel
 * Manages traffic light data dan operations
 */
class TrafficLight extends BaseModel {
  constructor() {
    super('traffic_lights');
  }

  /**
   * Get all traffic lights dengan status
   */
  async getAllWithStatus() {
    const connection = await require('../utils/database').getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT tl.*, 
                (SELECT COUNT(*) FROM traffic_data WHERE traffic_light_id = tl.id AND DATE(created_at) = CURDATE()) as vehicles_count
         FROM ${this.tableName} tl 
         ORDER BY tl.intersection_name ASC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Update traffic light status (async operation)
   */
  async updateStatus(trafficLightId, status, duration) {
    const connection = await require('../utils/database').getConnection();
    try {
      await connection.execute(
        `UPDATE ${this.tableName} SET current_status = ?, status_duration = ?, last_updated = NOW() WHERE id = ?`,
        [status, duration, trafficLightId]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Get traffic light berdasarkan intersection
   */
  async getByIntersection(intersectionName) {
    const connection = await require('../utils/database').getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE intersection_name = ?`,
        [intersectionName]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Automate traffic light based on vehicle density (async operation)
   */
  async automateTrafficLight(trafficLightId) {
    const connection = await require('../utils/database').getConnection();
    try {
      // Get current vehicle count for this traffic light
      const [data] = await connection.execute(
        `SELECT COUNT(*) as vehicle_count FROM traffic_data 
         WHERE traffic_light_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
        [trafficLightId]
      );

      const vehicleCount = data[0].vehicle_count;
      let newStatus, newDuration;

      // Logic: Determine status and duration based on vehicle density
      if (vehicleCount > 100) {
        newStatus = 'green';
        newDuration = 90; // 90 seconds for heavy traffic
      } else if (vehicleCount > 50) {
        newStatus = 'green';
        newDuration = 60; // 60 seconds for moderate traffic
      } else {
        newStatus = 'red';
        newDuration = 30; // 30 seconds for light traffic
      }

      await this.updateStatus(trafficLightId, newStatus, newDuration);
      return { status: newStatus, duration: newDuration, vehicleCount };
    } finally {
      connection.release();
    }
  }
}

module.exports = TrafficLight;
