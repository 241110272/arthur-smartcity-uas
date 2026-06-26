/**
 * Utility Functions for Smart City Traffic Management
 * Handles API requests, authentication, and localStorage
 */

const API_BASE_URL = '/api';

class Utils {
  /**
   * Make API request with proper headers and error handling
   */
  static async makeRequest(endpoint, options = {}) {
    const { method = 'GET', body = null } = options;

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body if present
    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      // Handle unauthorized
      if (response.status === 401) {
        this.removeToken();
        this.removeUser();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Get token from localStorage
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Set token to localStorage
   */
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Remove token from localStorage
   */
  static removeToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Get user data from localStorage
   */
  static getUser() {
    const user = localStorage.getItem('userData');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Set user data to localStorage
   */
  static setUser(user) {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  /**
   * Remove user data from localStorage
   */
  static removeUser() {
    localStorage.removeItem('userData');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Logout user
   */
  static logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = '/login';
  }

  /**
   * Get authorization headers
   */
  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format date to readable format
   */
  static formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  /**
   * Get status badge HTML
   */
  static getStatusBadge(status) {
    const badges = {
      'pending': '<span class="badge bg-warning">Pending</span>',
      'processing': '<span class="badge bg-info">Processing</span>',
      'resolved': '<span class="badge bg-success">Resolved</span>',
      'closed': '<span class="badge bg-secondary">Closed</span>',
      'red': '<span class="badge bg-danger">Red</span>',
      'yellow': '<span class="badge bg-warning">Yellow</span>',
      'green': '<span class="badge bg-success">Green</span>',
      'wait': '<span class="badge bg-danger">Wait</span>',
      'walk': '<span class="badge bg-success">Walk</span>',
      'low': '<span class="badge bg-success">Low</span>',
      'medium': '<span class="badge bg-warning">Medium</span>',
      'high': '<span class="badge bg-danger">High</span>',
      'critical': '<span class="badge bg-dark">Critical</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
  }

  /**
   * Show error alert
   */
  static showError(message, duration = 5000) {
    this.showAlert(message, 'danger', duration);
  }

  /**
   * Show success alert
   */
  static showSuccess(message, duration = 5000) {
    this.showAlert(message, 'success', duration);
  }

  /**
   * Show alert message
   */
  static showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed" role="alert" style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    const alertDiv = document.createElement('div');
    alertDiv.innerHTML = alertHTML;
    document.body.insertBefore(alertDiv.firstChild, document.body.firstChild);

    if (duration > 0) {
      setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
          const bsAlert = window.bootstrap ? new window.bootstrap.Alert(alert) : { close: function() { alert.remove(); } };
          bsAlert.close();
        }
      }, duration);
    }
  }
}

// Expose Utils globally (loaded as regular script, not ES module)
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
