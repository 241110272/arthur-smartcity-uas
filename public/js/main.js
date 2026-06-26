/**
 * Main JavaScript untuk Smart City Traffic Management System
 * Menghandle common functions dan event listeners
 */

const API_BASE_URL = '/api';

/**
 * Utility Functions
 */

// Get token dari localStorage
function getToken() {
  return localStorage.getItem('authToken');
}

// Set token ke localStorage
function setToken(token) {
  localStorage.setItem('authToken', token);
}

// Remove token dari localStorage
function removeToken() {
  localStorage.removeItem('authToken');
}

// Get Authorization header
function getAuthHeader() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fetch wrapper dengan auth header
async function apiFetch(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Handle unauthorized access
function handleUnauthorized() {
  removeToken();
  window.location.href = '/login';
}

// Show alert message
function showAlert(message, type = 'info', duration = 5000) {
  const alertId = 'alert-' + Date.now();
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  const alertContainer = document.querySelector('.container-fluid') || document.body;
  const alertDiv = document.createElement('div');
  alertDiv.innerHTML = alertHTML;
  alertContainer.insertBefore(alertDiv.firstChild, alertContainer.firstChild);

  if (duration > 0) {
    setTimeout(() => {
      const alert = document.getElementById(alertId);
      if (alert) {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }
    }, duration);
  }
}

// Format date ke bahasa Indonesia
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format status dengan badge
function getStatusBadge(status) {
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
    'low': '<span class="badge bg-success badge-low">Low</span>',
    'medium': '<span class="badge bg-warning badge-medium">Medium</span>',
    'high': '<span class="badge bg-danger badge-high">High</span>',
    'critical': '<span class="badge bg-dark badge-critical">Critical</span>'
  };

  return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: []
      .concat(password.length < minLength ? ['Minimal 8 karakter'] : [])
      .concat(!hasUpperCase ? ['Harus ada huruf besar'] : [])
      .concat(!hasLowerCase ? ['Harus ada huruf kecil'] : [])
      .concat(!hasNumbers ? ['Harus ada angka'] : [])
  };
}

// Update user info di navbar
async function updateUserInfo() {
  try {
    const token = getToken();
    if (!token) {
      showLoginElements();
      return;
    }

    const result = await apiFetch('/auth/me');
    if (result.success) {
      document.getElementById('userName').textContent = result.data.username;
      showLogoutElements();
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    showLoginElements();
  }
}

// Show login elements
function showLoginElements() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.parentElement.style.display = 'none';
  }
}

// Show logout elements
function showLogoutElements() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.parentElement.style.display = 'block';
  }
}

// Handle logout
function handleLogout() {
  removeToken();
  window.location.href = '/';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  updateUserInfo();

  // Setup logout link
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});
