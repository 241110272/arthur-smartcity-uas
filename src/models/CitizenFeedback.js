const BaseModel = require('./BaseModel');
const DatabaseUtil = require('../utils/database.util');

/**
 * Citizen Feedback Model
 * Mengelola feedback dan complaints dari masyarakat tentang sistem transportasi
 */
class CitizenFeedback extends BaseModel {
  constructor() {
    super('citizen_feedback');
  }

  /**
   * Submit feedback baru
   */
  async submitFeedback(data) {
    const {
      feedback_type, // complaint, suggestion, compliment, report
      category, // traffic, transportation, air_quality, general
      title,
      description,
      location_name,
      latitude,
      longitude,
      submitted_by, // user_id
      priority // low, medium, high
    } = data;

    const insertData = {
      feedback_type,
      category,
      title,
      description,
      location_name,
      latitude,
      longitude,
      submitted_by,
      priority,
      status: 'open', // open, in_review, in_progress, resolved, closed
      submitted_at: new Date(),
      updated_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(insertData);
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get open feedback tickets
   */
  async getOpenFeedback() {
    const query = `
      SELECT 
        cf.*,
        u.username as submitted_by_name,
        u.full_name
      FROM ${this.tableName} cf
      LEFT JOIN users u ON cf.submitted_by = u.id
      WHERE cf.status IN ('open', 'in_review', 'in_progress')
      ORDER BY cf.priority DESC, cf.submitted_at DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(id) {
    const query = `
      SELECT 
        cf.*,
        u.username as submitted_by_name,
        u.full_name
      FROM ${this.tableName} cf
      LEFT JOIN users u ON cf.submitted_by = u.id
      WHERE cf.id = ?
    `;
    return await DatabaseUtil.executeSelectOne(query, [id]);
  }

  /**
   * Get feedback by category
   */
  async getFeedbackByCategory(category) {
    const query = `
      SELECT 
        cf.*,
        u.username as submitted_by_name,
        u.full_name
      FROM ${this.tableName} cf
      LEFT JOIN users u ON cf.submitted_by = u.id
      WHERE cf.category = ?
      ORDER BY cf.submitted_at DESC
      LIMIT 50
    `;
    return await DatabaseUtil.executeSelect(query, [category]);
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(feedbackId, status, notes = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (notes) {
      updateData.admin_notes = notes;
    }

    const { updateClause, params } = DatabaseUtil.buildUpdateClause(updateData);
    params.push(feedbackId);

    const query = `UPDATE ${this.tableName} SET ${updateClause} WHERE id = ?`;
    return await DatabaseUtil.executeUpdate(query, params);
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStatistics(days = 30) {
    const query = `
      SELECT 
        feedback_type,
        COUNT(*) as count,
        SUM(CASE WHEN status IN ('open', 'in_review', 'in_progress') THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        AVG(TIMESTAMPDIFF(HOUR, submitted_at, updated_at)) as avg_resolution_hours
      FROM ${this.tableName}
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY feedback_type
    `;
    return await DatabaseUtil.executeSelect(query, [days]);
  }

  /**
   * Get feedback distribution by location
   */
  async getFeedbackByLocation() {
    const query = `
      SELECT 
        location_name,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN feedback_type = 'complaint' THEN 1 ELSE 0 END) as complaints,
        SUM(CASE WHEN feedback_type = 'suggestion' THEN 1 ELSE 0 END) as suggestions,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        AVG(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) * 100 as high_priority_percentage
      FROM ${this.tableName}
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY location_name
      ORDER BY total_feedback DESC
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get high priority feedback
   */
  async getHighPriorityFeedback() {
    const query = `
      SELECT 
        cf.*,
        u.username as submitted_by_name,
        u.full_name
      FROM ${this.tableName} cf
      LEFT JOIN users u ON cf.submitted_by = u.id
      WHERE cf.priority = 'high'
      AND cf.status IN ('open', 'in_review', 'in_progress')
      ORDER BY cf.submitted_at DESC
      LIMIT 20
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get user feedback history
   */
  async getUserFeedbackHistory(userId) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE submitted_by = ?
      ORDER BY submitted_at DESC
      LIMIT 50
    `;
    return await DatabaseUtil.executeSelect(query, [userId]);
  }

  /**
   * Add admin response ke feedback
   */
  async addAdminResponse(feedbackId, responseText, respondedBy) {
    const responseData = {
      feedback_id: feedbackId,
      response_text: responseText,
      responded_by: respondedBy,
      responded_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(responseData);
    const query = `INSERT INTO feedback_responses (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get feedback dengan responses
   */
  async getFeedbackWithResponses(feedbackId) {
    const query = `
      SELECT 
        cf.*,
        COALESCE(COUNT(fr.id), 0) as response_count,
        GROUP_CONCAT(
          JSON_OBJECT('text', fr.response_text, 'by', u.username, 'at', fr.responded_at)
        ) as responses
      FROM ${this.tableName} cf
      LEFT JOIN feedback_responses fr ON cf.id = fr.feedback_id
      LEFT JOIN users u ON fr.responded_by = u.id
      WHERE cf.id = ?
      GROUP BY cf.id
    `;
    return await DatabaseUtil.executeSelectOne(query, [feedbackId]);
  }
}

module.exports = CitizenFeedback;
