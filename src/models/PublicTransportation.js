const BaseModel = require('./BaseModel');
const DatabaseUtil = require('../utils/database.util');

/**
 * Public Transportation Model
 * Mengelola sistem transportasi umum kota (bus, MRT, LRT, dll)
 */
class PublicTransportation extends BaseModel {
  constructor() {
    super('public_transportation');
  }

  /**
   * Register transportasi baru ke sistem
   */
  async registerTransport(data) {
    const {
      vehicle_type, // bus, mrt, lrt, minibus, tram
      vehicle_number,
      route_name,
      current_location_lat,
      current_location_lng,
      occupancy_rate, // 0-100%
      status, // in_service, maintenance, waiting
      operator_id
    } = data;

    const insertData = {
      vehicle_type,
      vehicle_number,
      route_name,
      current_location_lat,
      current_location_lng,
      occupancy_rate,
      status,
      operator_id,
      last_update: new Date(),
      created_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(insertData);
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Update real-time location transportasi
   */
  async updateLocation(transportId, latitude, longitude, occupancyRate) {
    const updateData = {
      current_location_lat: latitude,
      current_location_lng: longitude,
      occupancy_rate: occupancyRate,
      last_update: new Date()
    };

    const { updateClause, params } = DatabaseUtil.buildUpdateClause(updateData);
    params.push(transportId);

    const query = `UPDATE ${this.tableName} SET ${updateClause} WHERE id = ?`;
    return await DatabaseUtil.executeUpdate(query, params);
  }

  /**
   * Get all transportation in service
   */
  async getActiveTransportation() {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE status = 'in_service'
      AND last_update >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY vehicle_type, route_name
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get transportation by route
   */
  async getTransportationByRoute(routeName) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE route_name = ?
      AND status = 'in_service'
      ORDER BY vehicle_type, last_update DESC
    `;
    return await DatabaseUtil.executeSelect(query, [routeName]);
  }

  /**
   * Get transportation near location
   */
  async getTransportationNearLocation(latitude, longitude, radiusKm = 2) {
    const query = `
      SELECT 
        *,
        (6371 * acos(cos(radians(?)) * cos(radians(current_location_lat)) * 
         cos(radians(current_location_lng) - radians(?)) + 
         sin(radians(?)) * sin(radians(current_location_lat)))) AS distance_km
      FROM ${this.tableName}
      WHERE status = 'in_service'
      AND last_update >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      AND (6371 * acos(cos(radians(?)) * cos(radians(current_location_lat)) * 
           cos(radians(current_location_lng) - radians(?)) + 
           sin(radians(?)) * sin(radians(current_location_lat)))) <= ?
      ORDER BY distance_km ASC
    `;
    return await DatabaseUtil.executeSelect(query, 
      [latitude, longitude, latitude, latitude, longitude, latitude, radiusKm]);
  }

  /**
   * Get transportation statistics
   */
  async getTransportationStatistics() {
    const query = `
      SELECT 
        vehicle_type,
        COUNT(*) as total_vehicles,
        SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) as active_vehicles,
        AVG(occupancy_rate) as avg_occupancy,
        COUNT(DISTINCT route_name) as active_routes
      FROM ${this.tableName}
      GROUP BY vehicle_type
      ORDER BY total_vehicles DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get route information dengan statistics
   */
  async getRouteStatistics(routeName) {
    const query = `
      SELECT 
        route_name,
        vehicle_type,
        COUNT(*) as vehicles_on_route,
        AVG(occupancy_rate) as avg_occupancy,
        MAX(occupancy_rate) as max_occupancy,
        MIN(occupancy_rate) as min_occupancy,
        MAX(last_update) as last_update
      FROM ${this.tableName}
      WHERE route_name = ?
      AND status = 'in_service'
      GROUP BY route_name, vehicle_type
    `;
    return await DatabaseUtil.executeSelect(query, [routeName]);
  }

  /**
   * Get all available routes
   */
  async getAllRoutes() {
    const query = `
      SELECT DISTINCT route_name FROM ${this.tableName}
      WHERE status = 'in_service'
      ORDER BY route_name
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Report transportation delay/issue
   */
  async reportTransportationIssue(transportId, issueType, description, reportedBy) {
    const issueData = {
      transport_id: transportId,
      issue_type: issueType, // delay, breakdown, accident, crowded
      description,
      reported_by: reportedBy,
      status: 'open',
      reported_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(issueData);
    const query = `INSERT INTO transportation_issues (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get current transportation issues
   */
  async getActiveTransportationIssues() {
    const query = `
      SELECT 
        ti.*,
        pt.vehicle_number,
        pt.route_name,
        u.username as reported_by_name
      FROM transportation_issues ti
      LEFT JOIN ${this.tableName} pt ON ti.transport_id = pt.id
      LEFT JOIN users u ON ti.reported_by = u.id
      WHERE ti.status = 'open'
      ORDER BY ti.reported_at DESC
      LIMIT 20
    `;
    return await DatabaseUtil.executeSelect(query);
  }
}

module.exports = PublicTransportation;
