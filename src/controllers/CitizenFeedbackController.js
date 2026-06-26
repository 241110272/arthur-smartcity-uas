const CitizenFeedback = require('../models/CitizenFeedback');
const feedbackModel = new CitizenFeedback();

/**
 * Citizen Feedback Controller
 * Handle citizen feedback dan complaints
 */
class CitizenFeedbackController {
  /**
   * Get all feedback
   */
  static async getAllFeedback(req, res, next) {
    try {
      const feedback = await feedbackModel.getOpenFeedback();
      res.json({
        success: true,
        data: feedback || []
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback by ID
   */
  static async getById(req, res, next) {
    try {
      const { feedbackId } = req.params;
      const feedback = await feedbackModel.getFeedbackById(feedbackId);

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit feedback baru
   */
  static async submitFeedback(req, res, next) {
    try {
      const {
        type,
        feedback_type,
        category,
        title,
        message,
        description,
        location_name,
        location,
        latitude,
        longitude,
        priority
      } = req.body;

      // Support both frontend and backend field names
      const feedbackType = type || feedback_type;
      const feedbackDescription = message || description || title || '';
      const locationName = location || location_name || '';

      if (!feedbackType || !category || !feedbackDescription) {
        return res.status(400).json({
          success: false,
          message: 'Type, category, and message/description harus diisi'
        });
      }

      const result = await feedbackModel.submitFeedback({
        feedback_type: feedbackType,
        category,
        title: title || feedbackDescription,
        description: feedbackDescription,
        location_name: locationName,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        submitted_by: req.user?.userId || req.user?.id || 1,
        priority: priority || 'medium'
      });

      res.status(201).json({
        success: true,
        message: 'Feedback berhasil dikirim',
        data: {
          feedbackId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get open feedback (admin only)
   */
  static async getOpenFeedback(req, res, next) {
    try {
      const feedback = await feedbackModel.getOpenFeedback();

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback by category
   */
  static async getFeedbackByCategory(req, res, next) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category parameter diperlukan'
        });
      }

      const feedback = await feedbackModel.getFeedbackByCategory(category);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update feedback status (admin only)
   */
  static async updateFeedbackStatus(req, res, next) {
    try {
      const { feedbackId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status harus diisi'
        });
      }

      await feedbackModel.updateFeedbackStatus(feedbackId, status, notes);

      res.json({
        success: true,
        message: 'Status feedback berhasil diperbarui'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback statistics (admin only)
   */
  static async getStatistics(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const statistics = await feedbackModel.getFeedbackStatistics(parseInt(days));

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback by location
   */
  static async getFeedbackByLocation(req, res, next) {
    try {
      const locationStats = await feedbackModel.getFeedbackByLocation();

      res.json({
        success: true,
        data: locationStats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get high priority feedback (admin only)
   */
  static async getHighPriorityFeedback(req, res, next) {
    try {
      const feedback = await feedbackModel.getHighPriorityFeedback();

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user feedback history
   */
  static async getUserFeedbackHistory(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID parameter diperlukan'
        });
      }

      const feedback = await feedbackModel.getUserFeedbackHistory(userId);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add admin response ke feedback (admin only)
   */
  static async addAdminResponse(req, res, next) {
    try {
      const { feedbackId } = req.params;
      const { response_text } = req.body;

      if (!response_text) {
        return res.status(400).json({
          success: false,
          message: 'Response text harus diisi'
        });
      }

      const result = await feedbackModel.addAdminResponse(
        feedbackId,
        response_text,
        req.user?.userId || req.user?.id || 1
      );

      res.status(201).json({
        success: true,
        message: 'Response berhasil ditambahkan',
        data: {
          responseId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feedback dengan responses
   */
  static async getFeedbackWithResponses(req, res, next) {
    try {
      const { feedbackId } = req.params;

      if (!feedbackId) {
        return res.status(400).json({
          success: false,
          message: 'Feedback ID parameter diperlukan'
        });
      }

      const feedback = await feedbackModel.getFeedbackWithResponses(feedbackId);

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate feedback report (admin only)
   */
  static async generateReport(req, res, next) {
    try {
      const { days = 30, format = 'json' } = req.query;

      const statistics = await feedbackModel.getFeedbackStatistics(parseInt(days));
      const locationStats = await feedbackModel.getFeedbackByLocation();
      const highPriority = await feedbackModel.getHighPriorityFeedback();

      const report = {
        generated_at: new Date(),
        period_days: parseInt(days),
        summary: statistics,
        location_breakdown: locationStats,
        high_priority_items: highPriority
      };

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CitizenFeedbackController;
