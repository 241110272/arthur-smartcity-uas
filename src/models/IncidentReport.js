const BaseModel = require('./BaseModel');
const pool = require('../utils/database');

/**
 * Incident Report Model - Extends BaseModel
 * Manages traffic incident reports
 */
class IncidentReport extends BaseModel {
  constructor() {
    super('incident_reports');
  }

  /**
   * Create incident report
   */
  async createReport(reportData) {
    const data = {
      user_id: reportData.user_id,
      title: reportData.title,
      description: reportData.description,
      incident_type: reportData.incident_type,
      location: reportData.location,
      severity: reportData.severity || 'medium',
      status: 'pending',
      image_url: reportData.image_url || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return await this.create(data);
  }

  /**
   * Get incidents dengan pagination (async operation)
   */
  async getIncidentsWithPagination(page = 1, limit = 10) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await connection.execute(
        `SELECT ir.*, u.username, u.full_name 
         FROM ${this.tableName} ir 
         LEFT JOIN users u ON ir.user_id = u.id 
         ORDER BY ir.created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM ${this.tableName}`
      );

      return {
        data: rows,
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Update incident status
   */
  async updateStatus(incidentId, status, notes = null) {
    return await this.update(incidentId, {
      status: status,
      admin_notes: notes,
      updated_at: new Date()
    });
  }

  /**
   * Get incidents berdasarkan severity (async operation)
   */
  async getIncidentsBySeverity(severity) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE severity = ? ORDER BY created_at DESC`,
        [severity]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get incidents berdasarkan type
   */
  async getIncidentsByType(incidentType) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE incident_type = ? ORDER BY created_at DESC`,
        [incidentType]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = IncidentReport;
