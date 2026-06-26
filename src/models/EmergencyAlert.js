const BaseModel = require('./BaseModel');
const DatabaseUtil = require('../utils/database.util');

/**
 * Emergency Alert Model
 * Mengelola alerts untuk keadaan darurat dan emergency situations
 */
class EmergencyAlert extends BaseModel {
  constructor() {
    super('emergency_alerts');
  }

  /**
   * Create emergency alert
   */
  async createAlert(data) {
    const {
      alert_type, // accident, hazard, emergency_vehicle, natural_disaster
      severity, // low, medium, high, critical
      location_name,
      latitude,
      longitude,
      description,
      created_by // user_id
    } = data;

    const insertData = {
      alert_type,
      severity,
      location_name,
      latitude,
      longitude,
      description,
      status: 'active', // active, resolved, cancelled
      created_by,
      created_at: new Date(),
      updated_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(insertData);
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts() {
    const query = `
      SELECT 
        a.*,
        u.username as created_by_name,
        u.full_name
      FROM ${this.tableName} a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.status = 'active'
      AND a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY a.severity DESC, a.created_at DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get critical alerts
   */
  async getCriticalAlerts() {
    const query = `
      SELECT 
        a.*,
        u.username as created_by_name,
        u.full_name
      FROM ${this.tableName} a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.status = 'active'
      AND a.severity IN ('high', 'critical')
      AND a.created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
      ORDER BY a.created_at DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get alerts by type
   */
  async getAlertsByType(alertType) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE alert_type = ?
      AND status = 'active'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY created_at DESC
    `;
    return await DatabaseUtil.executeSelect(query, [alertType]);
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId, status, resolvedAt = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (resolvedAt) {
      updateData.resolved_at = resolvedAt;
    }

    const { updateClause, params } = DatabaseUtil.buildUpdateClause(updateData);
    params.push(alertId);

    const query = `UPDATE ${this.tableName} SET ${updateClause} WHERE id = ?`;
    return await DatabaseUtil.executeUpdate(query, params);
  }

  /**
   * Get alerts near location
   */
  async getAlertsNearLocation(latitude, longitude, radiusKm = 5) {
    const query = `
      SELECT 
        a.*,
        u.username as created_by_name,
        (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
         cos(radians(a.longitude) - radians(?)) + 
         sin(radians(?)) * sin(radians(a.latitude)))) AS distance_km
      FROM ${this.tableName} a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.status = 'active'
      AND (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
           cos(radians(a.longitude) - radians(?)) + 
           sin(radians(?)) * sin(radians(a.latitude)))) <= ?
      ORDER BY distance_km ASC
    `;
    return await DatabaseUtil.executeSelect(query, 
      [latitude, longitude, latitude, latitude, longitude, latitude, radiusKm]);
  }

  /**
   * Get emergency vehicle response history
   */
  async getEmergencyVehicleAlerts() {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE alert_type = 'emergency_vehicle'
      AND status IN ('active', 'resolved')
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Broadcast alert to connected systems
   */
  async broadcastAlert(alertId) {
    const alert = await this.findById(alertId);
    if (!alert) return null;

    // Log broadcast untuk audit trail
    const broadcastData = {
      alert_id: alertId,
      broadcast_at: new Date(),
      status: 'broadcast_sent'
    };

    // Implementasi real-time broadcasting via Socket.IO di server.js
    return alert;
  }
}

module.exports = EmergencyAlert;
