// Utility functions for API calls and storage
const API_BASE_URL = '/api';
let currentUser = null;

function getToken() {
  return localStorage.getItem('authToken');
}

function getUser() {
  const user = localStorage.getItem('userData');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('userData', JSON.stringify(user));
}

function removeToken() {
  localStorage.removeItem('authToken');
}

function removeUser() {
  localStorage.removeItem('userData');
}

function isAuthenticated() {
  return !!getToken();
}

async function makeRequest(endpoint, options = {}) {
  const { method = 'GET', body = null } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    removeToken();
    removeUser();
    window.location.href = '/login';
    return { success: false, message: 'Unauthorized' };
  }

  return data;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    if (type === 'error') alert(message);
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  
  const iconMap = {
    'success': '<i class="fas fa-check-circle toast-icon"></i>',
    'error': '<i class="fas fa-exclamation-circle toast-icon"></i>',
    'info': '<i class="fas fa-info-circle toast-icon"></i>'
  };
  
  toast.innerHTML = `
    ${iconMap[type] || iconMap['info']}
    <div class="toast-content">${message}</div>
    <button type="button" class="btn-close btn-close-white ms-auto" aria-label="Close"></button>
  `;
  
  container.appendChild(toast);
  
  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showError(message) {
  console.error(message);
  showToast(message, 'error');
}

function showSuccess(message) {
  showToast(message, 'success');
}

function isAdminUser(user = currentUser) {
  return user?.role === 'admin' || user?.role === 'superadmin';
}

function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

let trafficChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return;
  }

  await initializeDashboard();
  setupEventListeners();
});

/**
 * Initialize dashboard data
 */
async function initializeDashboard() {
  try {
    await loadCurrentUser();
    await loadDashboardSummaries();
    await initializeCharts();
    bindModalForms();
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Gagal memuat data dashboard');
  }
}

async function loadCurrentUser() {
  currentUser = getUser();

  if (!currentUser) {
    const response = await makeRequest('/auth/me');
    if (response?.success) {
      currentUser = response.data;
      setUser(currentUser);
    }
  }

  if (currentUser) {
    document.getElementById('userName').textContent = currentUser.full_name || currentUser.username || 'User';
    if (!isAdminUser(currentUser)) {
      const adminDropdown = document.getElementById('adminDropdown');
      if (adminDropdown) {
        adminDropdown.closest('li').style.display = 'none';
      }
      const addTrafficLightBtn = document.getElementById('addTrafficLightBtn');
      const addPedestrianBtn = document.getElementById('addPedestrianBtn');
      if (addTrafficLightBtn) addTrafficLightBtn.style.display = 'none';
      if (addPedestrianBtn) addPedestrianBtn.style.display = 'none';
    }
  }
}

async function loadDashboardSummaries() {
  await Promise.all([loadTrafficLights(), loadPedestrianCrossings(), loadIncidents(), loadUserSummary()]);
}

async function loadUserSummary() {
  if (isAdminUser(currentUser)) {
    const response = await makeRequest('/auth/users');
    if (response?.success && Array.isArray(response.data)) {
      document.getElementById('userCount').textContent = response.data.length;
      return;
    }
  }

  document.getElementById('userCount').textContent = '1';
}

/**
 * Load traffic lights data
 */
async function loadTrafficLights() {
  try {
    const response = await makeRequest('/traffic-lights');
    if (response?.success) {
      const data = response.data || [];
      document.getElementById('trafficLightCount').textContent = data.length;

      const listHTML = data.map(light => `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div>
            <h6 class="mb-0">${light.intersection_name}</h6>
            <small class="text-muted">${light.location}</small>
          </div>
          <span class="badge bg-${getStatusColor(light.current_status)}">${light.current_status}</span>
        </div>
      `).join('');

      document.getElementById('trafficLightsList').innerHTML = listHTML || '<p class="text-muted">No traffic lights</p>';
    }
  } catch (error) {
    console.error('Error loading traffic lights:', error);
  }
}

/**
 * Load pedestrian crossings data
 */
async function loadPedestrianCrossings() {
  try {
    const response = await makeRequest('/pedestrians');
    if (response?.success) {
      const data = response.data || [];
      document.getElementById('pedestrianCount').textContent = data.length;
    }
  } catch (error) {
    console.error('Error loading pedestrian crossings:', error);
  }
}

/**
 * Load incidents data
 */
async function loadIncidents() {
  try {
    const response = await makeRequest('/incidents?page=1&limit=5');
    if (response?.success) {
      const incidents = Array.isArray(response.data) ? response.data : response.data?.data || [];
      document.getElementById('incidentCount').textContent = incidents.length;

      const incidentsHTML = incidents.map(incident => `
        <tr>
          <td>${incident.title}</td>
          <td>${incident.incident_type}</td>
          <td><span class="badge bg-${getSeverityColor(incident.severity)}">${incident.severity}</span></td>
          <td><span class="badge bg-${getIncidentStatusColor(incident.status)}">${incident.status}</span></td>
          <td>${formatDate(incident.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewIncident(${incident.id})">View</button>
          </td>
        </tr>
      `).join('');

      document.getElementById('incidentsTable').innerHTML = incidentsHTML || '<tr><td colspan="6" class="text-center text-muted">No incidents</td></tr>';
    }
  } catch (error) {
    console.error('Error loading incidents:', error);
  }
}

/**
 * Initialize charts
 */
async function initializeCharts() {
  try {
    const response = await makeRequest('/traffic-monitoring/statistics?days=7');
    const data = response?.success && Array.isArray(response.data) ? response.data : [];
    const chartData = data.length > 0 ? data : [{ location_name: 'No data', avg_vehicles: 0, avg_speed: 0 }];
    const labels = chartData.map(d => d.location_name || 'Unknown').slice(0, 6);
    const vehicleData = chartData.map(d => Number(d.avg_vehicles || 0)).slice(0, 6);
    const speedData = chartData.map(d => Number(d.avg_speed || 0)).slice(0, 6);

    const ctx = document.getElementById('trafficChart');
    if (ctx && trafficChart) {
      trafficChart.destroy();
    }

    if (ctx) {
      trafficChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Average Vehicle Count',
              data: vehicleData,
              backgroundColor: '#28a745',
              borderColor: '#20c997',
              borderWidth: 2
            },
            {
              label: 'Average Speed (km/h)',
              data: speedData,
              backgroundColor: '#17a2b8',
              borderColor: '#138496',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
  const tabLinks = document.querySelectorAll('[data-tab]');
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = e.currentTarget.getAttribute('data-tab');

      document.querySelectorAll('.section-content').forEach(section => {
        section.style.display = 'none';
      });

      const selectedSection = document.getElementById(tabName + 'Tab');
      if (selectedSection) {
        selectedSection.style.display = 'block';

        if (tabName === 'traffic-lights') {
          loadTrafficLightsManagement();
        } else if (tabName === 'pedestrians') {
          loadPedestriansManagement();
        } else if (tabName === 'incidents') {
          loadIncidentsManagement();
        } else if (tabName === 'users') {
          loadUsersManagement();
        }
      }
    });
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      removeToken();
      removeUser();
      window.location.href = '/';
    });
  }
}

function bindModalForms() {
  const trafficLightForm = document.getElementById('trafficLightForm');
  const pedestrianForm = document.getElementById('pedestrianForm');
  const incidentForm = document.getElementById('incidentForm');

  if (trafficLightForm) {
    trafficLightForm.addEventListener('submit', createTrafficLight);
  }

  if (pedestrianForm) {
    pedestrianForm.addEventListener('submit', createPedestrianCrossing);
  }

  if (incidentForm) {
    incidentForm.addEventListener('submit', reportIncident);
  }

  // Setup new feature forms
  bindNewFeatureForms();
  
  // Setup role-based menu visibility
  handleAdminMenuVisibility();
  
  // Setup tab navigation
  setupTabNavigationUpdated();
}

/**
 * Load traffic lights management tab
 */
async function loadTrafficLightsManagement() {
  try {
    const response = await makeRequest('/traffic-lights');
    if (response?.success) {
      const data = response.data || [];
      const html = data.map(light => `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${light.intersection_name}</h5>
              <p class="card-text text-muted">${light.location}</p>
              <p class="mb-2">
                <small>Status: <span class="badge bg-${getStatusColor(light.current_status)}">${light.current_status}</span></small>
              </p>
              <p class="mb-3">
                <small>Duration: ${light.status_duration}s</small>
              </p>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-primary" onclick="updateTrafficLight(${light.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTrafficLight(${light.id})">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      document.getElementById('trafficLightsContainer').innerHTML = html || '<div class="col-12"><p class="text-muted text-center">No traffic lights</p></div>';
    }
  } catch (error) {
    console.error('Error loading traffic lights management:', error);
  }
}

/**
 * Load pedestrians management tab
 */
async function loadPedestriansManagement() {
  try {
    const response = await makeRequest('/pedestrians');
    if (response?.success) {
      const data = response.data || [];
      const html = data.map(crossing => `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${crossing.location_name}</h5>
              <p class="card-text text-muted">${crossing.street_name}</p>
              <p class="mb-2">
                <small>Signal: <span class="badge bg-${crossing.current_signal === 'walk' ? 'success' : 'danger'}">${crossing.current_signal}</span></small>
              </p>
              <p class="mb-3">
                <small>Wait Time: ${crossing.wait_time_estimate}s</small>
              </p>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-primary" onclick="updatePedestrian(${crossing.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePedestrian(${crossing.id})">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      document.getElementById('pedestriansContainer').innerHTML = html || '<div class="col-12"><p class="text-muted text-center">No pedestrian crossings</p></div>';
    }
  } catch (error) {
    console.error('Error loading pedestrians management:', error);
  }
}

/**
 * Load incidents management tab
 */
async function loadIncidentsManagement() {
  try {
    const response = await makeRequest('/incidents?page=1&limit=20');
    if (response?.success) {
      const incidents = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const html = incidents.map(incident => `
        <tr>
          <td>${incident.id}</td>
          <td>${incident.title}</td>
          <td>${incident.incident_type}</td>
          <td>${incident.location}</td>
          <td><span class="badge bg-${getSeverityColor(incident.severity)}">${incident.severity}</span></td>
          <td><span class="badge bg-${getIncidentStatusColor(incident.status)}">${incident.status}</span></td>
          <td>${formatDate(incident.created_at)}</td>
          <td>
            <div class="btn-group" role="group">
              <button class="btn btn-sm btn-primary" onclick="viewIncident(${incident.id})">View</button>
              <button class="btn btn-sm btn-danger" onclick="deleteIncident(${incident.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');

      document.getElementById('allIncidentsTable').innerHTML = html || '<tr><td colspan="8" class="text-center text-muted">No incidents</td></tr>';
    }
  } catch (error) {
    console.error('Error loading incidents management:', error);
  }
}

/**
 * Load users management tab
 */
async function loadUsersManagement() {
  if (!isAdminUser(currentUser)) {
    const user = currentUser || { id: '-', username: '-', email: '-', full_name: '-', role: '-', phone: '-', created_at: '-' };
    document.getElementById('usersTable').innerHTML = `
      <tr>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.full_name}</td>
        <td><span class="badge bg-info">${user.role}</span></td>
        <td>${user.phone || '-'}</td>
        <td>${user.created_at || '-'}</td>
      </tr>
    `;
    return;
  }

  try {
    const response = await makeRequest('/auth/users');
    if (response?.success && Array.isArray(response.data)) {
      const usersHTML = response.data.map(user => `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.full_name}</td>
          <td><span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'operator' ? 'warning' : 'info'}">${user.role}</span></td>
          <td>${user.phone || '-'}</td>
          <td>${formatDate(user.created_at)}</td>
        </tr>
      `).join('');

      document.getElementById('usersTable').innerHTML = usersHTML || '<tr><td colspan="7" class="text-center text-muted">No users found</td></tr>';
      return;
    }

    document.getElementById('usersTable').innerHTML = `<tr><td colspan="7" class="text-center text-muted">${response?.message || 'Unable to load users'}</td></tr>`;
  } catch (error) {
    console.error('Error loading users management:', error);
    document.getElementById('usersTable').innerHTML = '<tr><td colspan="7" class="text-center text-muted">Unable to load users</td></tr>';
  }
}

/**
 * Create traffic light endpoint
 */
async function createTrafficLight(event) {
  event.preventDefault();

  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat menambahkan traffic light.');
  }

  const intersection_name = document.getElementById('intersectionName').value.trim();
  const location = document.getElementById('location').value.trim();
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;

  if (!intersection_name || !location) {
    return showError('Isi nama intersection dan lokasi.');
  }

  try {
    const response = await makeRequest('/traffic-lights', {
      method: 'POST',
      body: {
        intersection_name,
        location,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null
      }
    });

    if (response?.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('trafficLightModal'));
      if (modal) modal.hide();
      document.getElementById('trafficLightForm').reset();
      await loadTrafficLights();
      await loadTrafficLightsManagement();
    } else {
      showError(response.message || 'Gagal menambahkan traffic light');
    }
  } catch (error) {
    console.error('Error creating traffic light:', error);
    showError('Terjadi kesalahan saat menambahkan traffic light.');
  }
}

/**
 * Create pedestrian crossing endpoint
 */
async function createPedestrianCrossing(event) {
  event.preventDefault();

  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat menambahkan pedestrian crossing.');
  }

  const location_name = document.getElementById('crossingLocation').value.trim();
  const street_name = document.getElementById('streetName').value.trim();
  const latitude = document.getElementById('crossingLatitude').value;
  const longitude = document.getElementById('crossingLongitude').value;
  const current_signal = document.getElementById('currentSignal').value;
  const wait_time_estimate = document.getElementById('waitTimeEstimate').value;

  if (!location_name || !street_name) {
    return showError('Isi nama lokasi dan nama jalan.');
  }

  try {
    const response = await makeRequest('/pedestrians', {
      method: 'POST',
      body: {
        location_name,
        street_name,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        current_signal,
        wait_time_estimate: wait_time_estimate ? Number(wait_time_estimate) : 0
      }
    });

    if (response?.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('pedestrianModal'));
      if (modal) modal.hide();
      document.getElementById('pedestrianForm').reset();
      await loadPedestrianCrossings();
      await loadPedestriansManagement();
    } else {
      showError(response.message || 'Gagal menambahkan pedestrian crossing');
    }
  } catch (error) {
    console.error('Error creating pedestrian crossing:', error);
    showError('Terjadi kesalahan saat menambahkan pedestrian crossing.');
  }
}

/**
 * Report incident endpoint
 */
async function reportIncident(event) {
  event.preventDefault();

  const title = document.getElementById('incidentTitle').value.trim();
  const incident_type = document.getElementById('incidentType').value.trim();
  const location = document.getElementById('incidentLocation').value.trim();
  const severity = document.getElementById('incidentSeverity').value;
  const description = document.getElementById('incidentDescription').value.trim();

  if (!title || !incident_type || !location) {
    return showError('Isi judul, tipe, dan lokasi incident.');
  }

  try {
    const response = await makeRequest('/incidents', {
      method: 'POST',
      body: {
        user_id: currentUser?.id,
        title,
        incident_type,
        location,
        severity,
        description
      }
    });

    if (response?.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('reportIncidentModal'));
      if (modal) modal.hide();
      document.getElementById('incidentForm').reset();
      await loadIncidents();
      await loadIncidentsManagement();
    } else {
      showError(response.message || 'Gagal melaporkan incident');
    }
  } catch (error) {
    console.error('Error reporting incident:', error);
    showError('Terjadi kesalahan saat melaporkan incident.');
  }
}

/**
 * Delete functions
 */
async function deleteTrafficLight(id) {
  if (!confirm('Are you sure you want to delete this traffic light?')) {
    return;
  }

  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat menghapus traffic light.');
  }

  try {
    const response = await makeRequest(`/traffic-lights/${id}`, {
      method: 'DELETE'
    });

    if (response?.success) {
      await loadTrafficLights();
      await loadTrafficLightsManagement();
    } else {
      showError(response.message || 'Gagal menghapus traffic light');
    }
  } catch (error) {
    console.error('Error deleting traffic light:', error);
    showError('Terjadi kesalahan saat menghapus traffic light.');
  }
}

async function deletePedestrian(id) {
  if (!confirm('Are you sure you want to delete this pedestrian crossing?')) {
    return;
  }

  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat menghapus pedestrian crossing.');
  }

  try {
    const response = await makeRequest(`/pedestrians/${id}`, {
      method: 'DELETE'
    });

    if (response?.success) {
      await loadPedestrianCrossings();
      await loadPedestriansManagement();
    } else {
      showError(response.message || 'Gagal menghapus pedestrian crossing');
    }
  } catch (error) {
    console.error('Error deleting pedestrian crossing:', error);
    showError('Terjadi kesalahan saat menghapus pedestrian crossing.');
  }
}

async function deleteIncident(id) {
  if (!confirm('Are you sure you want to delete this incident?')) {
    return;
  }

  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat menghapus incident.');
  }

  try {
    const response = await makeRequest(`/incidents/${id}`, {
      method: 'DELETE'
    });

    if (response?.success) {
      await loadIncidents();
      await loadIncidentsManagement();
    } else {
      showError(response.message || 'Gagal menghapus incident');
    }
  } catch (error) {
    console.error('Error deleting incident:', error);
    showError('Terjadi kesalahan saat menghapus incident.');
  }
}

async function viewIncident(id) {
  try {
    const response = await makeRequest(`/incidents/${id}`);
    if (response?.success && response.data) {
      const incident = response.data;
      const modalHtml = `
        <div class="modal fade" id="dynamicIncidentModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content glass-card border-0 neon-border">
              <div class="modal-header border-bottom border-light">
                <h5 class="modal-title">Incident Details</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Title:</strong> ${incident.title}</p>
                <p><strong>Type:</strong> ${incident.incident_type}</p>
                <p><strong>Severity:</strong> <span class="badge bg-${getSeverityColor(incident.severity)}">${incident.severity}</span></p>
                <p><strong>Status:</strong> <span class="badge bg-${getIncidentStatusColor(incident.status)}">${incident.status}</span></p>
                <p><strong>Location:</strong> ${incident.location}</p>
                <p><strong>Description:</strong> ${incident.description || '-'}</p>
                <p><strong>Created:</strong> ${formatDate(incident.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      const oldModal = document.getElementById('dynamicIncidentModal');
      if (oldModal) oldModal.remove();
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modal = new bootstrap.Modal(document.getElementById('dynamicIncidentModal'));
      modal.show();
    }
  } catch (error) {
    console.error('Error fetching incident:', error);
    showError('Gagal memuat detail incident.');
  }
}

/**
 * ==================== NEW SMART CITY FEATURES ====================
 */

/**
 * Load Emergency Alerts
 */
async function loadEmergencyAlerts() {
  try {
    const response = await makeRequest('/emergency-alerts/active');
    if (response?.success) {
      const alerts = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // Update counts
      document.getElementById('activeAlertsCount').textContent = alerts.length;
      const criticalCount = alerts.filter(a => a.severity === 'critical').length;
      document.getElementById('criticalAlertsCount').textContent = criticalCount;

      // Build table
      const alertsHTML = alerts.map(alert => `
        <tr>
          <td>${alert.id}</td>
          <td><span class="badge bg-secondary">${alert.type}</span></td>
          <td>${alert.location}</td>
          <td><span class="badge bg-${getSeverityColor(alert.severity)}">${alert.severity}</span></td>
          <td><span class="badge bg-info">${alert.status}</span></td>
          <td>${formatDate(alert.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewEmergencyAlert(${alert.id})">View</button>
          </td>
        </tr>
      `).join('');

      document.getElementById('emergencyAlertsTable').innerHTML = alertsHTML || '<tr><td colspan="7" class="text-center text-muted">No alerts</td></tr>';
    }
  } catch (error) {
    console.error('Error loading emergency alerts:', error);
  }
}

async function viewEmergencyAlert(id) {
  try {
    const response = await makeRequest(`/emergency-alerts/${id}`);
    if (response?.success && response.data) {
      const alertData = response.data;
      const modalHtml = `
        <div class="modal fade" id="dynamicAlertModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content glass-card border-0 neon-border-danger">
              <div class="modal-header border-bottom border-light">
                <h5 class="modal-title">Emergency Alert</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Type:</strong> ${alertData.alert_type}</p>
                <p><strong>Location:</strong> ${alertData.location_name}</p>
                <p><strong>Severity:</strong> <span class="badge bg-${getSeverityColor(alertData.severity)}">${alertData.severity}</span></p>
                <p><strong>Status:</strong> ${alertData.status}</p>
                <p><strong>Description:</strong> ${alertData.description || '-'}</p>
                <p><strong>Created:</strong> ${formatDate(alertData.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      const oldModal = document.getElementById('dynamicAlertModal');
      if (oldModal) oldModal.remove();
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modal = new bootstrap.Modal(document.getElementById('dynamicAlertModal'));
      modal.show();
    }
  } catch (error) {
    console.error('Error fetching alert:', error);
  }
}

let globalAirQualityData = [];

/**
 * Load Air Quality Data
 */
async function loadAirQualityData() {
  try {
    const response = await makeRequest('/air-quality/latest');
    if (response?.success) {
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const data = rawData.map(item => ({
        id: item.id,
        location_name: item.location_name || item.location || 'Unknown',
        aqi: item.aqi ?? item.aqi_index ?? item.aqiIndex ?? 0,
        pm2_5: item.pm2_5 ?? item.pm25 ?? item.pm_2_5 ?? null,
        pm10: item.pm10 ?? item.pm10 ?? null,
        o3: item.o3 ?? null,
        no2: item.no2 ?? null,
        co: item.co ?? null,
        quality_level: item.quality_level || item.qualityLevel || 'Unknown',
        recorded_at: item.recorded_at || item.updated_at || item.last_updated || null
      }));
      
      globalAirQualityData = data;
      
      // Update counts based on quality level
      const goodCount = data.filter(d => d.quality_level === 'Good').length;
      const moderateCount = data.filter(d => d.quality_level === 'Moderate').length;
      const unhealthyCount = data.filter(d => ['Unhealthy', 'Very Unhealthy', 'Hazardous'].includes(d.quality_level)).length;

      document.getElementById('goodAQCount').textContent = goodCount;
      document.getElementById('moderateAQCount').textContent = moderateCount;
      document.getElementById('unhealthyAQCount').textContent = unhealthyCount;

      const isAdmin = isAdminUser(currentUser);
      const aqActionHeader = document.getElementById('aqActionHeader');
      if (aqActionHeader) aqActionHeader.style.display = 'table-cell';
      
      const addAqBtn = document.getElementById('addAirQualityBtn');
      if (addAqBtn) addAqBtn.style.display = isAdmin ? 'inline-block' : 'none';

      // Build table
      const dataHTML = data.map(item => `
        <tr>
          <td>${item.location_name}</td>
          <td><strong>${item.aqi}</strong></td>
          <td>${item.pm2_5 ?? '-'}</td>
          <td>${item.pm10 ?? '-'}</td>
          <td><span class="badge bg-${getQualityColor(item.quality_level)}">${item.quality_level}</span></td>
          <td>${item.recorded_at ? formatDate(item.recorded_at) : '-'}</td>
          <td>
            <button class="btn btn-sm btn-info me-1" onclick="viewAirQuality(${item.id})">View</button>
            ${isAdmin ? `<button class="btn btn-sm btn-warning" onclick="editAirQuality(${item.id}, '${item.location_name}', ${item.aqi})">Edit</button>` : ''}
          </td>
        </tr>
      `).join('');

      document.getElementById('airQualityTable').innerHTML = dataHTML || '<tr><td colspan="7" class="text-center text-muted">No data available</td></tr>';
    }
  } catch (error) {
    console.error('Error loading air quality data:', error);
  }
}

function viewAirQuality(id) {
  const aq = globalAirQualityData.find(item => item.id == id);
  if (!aq) return showError('Data not found');
  
  document.getElementById('viewAqLocation').textContent = aq.location_name;
  document.getElementById('viewAqIndex').textContent = aq.aqi;
  
  const statusBadge = document.getElementById('viewAqStatus');
  statusBadge.textContent = aq.quality_level;
  statusBadge.className = `badge bg-${getQualityColor(aq.quality_level)}`;
  
  document.getElementById('viewAqPm25').textContent = aq.pm2_5 ?? '-';
  document.getElementById('viewAqPm10').textContent = aq.pm10 ?? '-';
  document.getElementById('viewAqO3').textContent = aq.o3 ?? '-';
  document.getElementById('viewAqNo2').textContent = aq.no2 ?? '-';
  document.getElementById('viewAqCo').textContent = aq.co ?? '-';
  document.getElementById('viewAqRecordedAt').textContent = aq.recorded_at ? formatDate(aq.recorded_at) : '-';
  
  const modal = new bootstrap.Modal(document.getElementById('viewAirQualityModal'));
  modal.show();
}

async function editAirQuality(id, locationName, currentAqi) {
  if (!id) return showError('Invalid ID');
  const newAqi = prompt(`Update AQI for ${locationName}\nCurrent AQI: ${currentAqi}\nNew AQI:`);
  
  if (newAqi === null || newAqi.trim() === '') return;
  const aqiNum = parseInt(newAqi);
  if (isNaN(aqiNum)) return showError('AQI must be a valid number');

  let qualityLevel = 'Moderate';
  if (aqiNum <= 50) qualityLevel = 'Good';
  else if (aqiNum <= 100) qualityLevel = 'Moderate';
  else if (aqiNum <= 150) qualityLevel = 'Unhealthy for Sensitive Groups';
  else if (aqiNum <= 200) qualityLevel = 'Unhealthy';
  else if (aqiNum <= 300) qualityLevel = 'Very Unhealthy';
  else qualityLevel = 'Hazardous';

  try {
    const response = await makeRequest(`/air-quality/admin/update/${id}`, {
      method: 'PUT',
      body: { aqi: aqiNum, quality_level: qualityLevel }
    });
    
    if (response?.success) {
      showSuccess('Air quality updated successfully!');
      await loadAirQualityData();
    } else {
      showError(response?.message || 'Failed to update air quality');
    }
  } catch (error) {
    console.error('Error updating air quality:', error);
    showError('Error updating air quality');
  }
}

function getQualityColor(level) {
  const colors = {
    'Good': 'success',
    'Moderate': 'warning',
    'Unhealthy for Sensitive Groups': 'warning',
    'Unhealthy': 'danger',
    'Very Unhealthy': 'dark',
    'Hazardous': 'dark'
  };
  return colors[level] || 'secondary';
}

/**
 * Load Public Transportation Data
 */
async function loadPublicTransportationData() {
  try {
    const response = await makeRequest('/public-transportation/active');
    if (response?.success) {
      const vehicles = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // Update counts
      document.getElementById('activeVehiclesCount').textContent = vehicles.length;
      
      // Load issues count
      const issuesResponse = await makeRequest('/public-transportation/admin/issues');
      if (issuesResponse?.success) {
        const issuesCount = Array.isArray(issuesResponse.data) ? issuesResponse.data.length : 0;
        document.getElementById('issuesCount').textContent = issuesCount;
      }

      // Build table
      const vehiclesHTML = vehicles.map(vehicle => `
        <tr>
          <td>${vehicle.vehicle_id}</td>
          <td><span class="badge bg-info">${vehicle.vehicle_type}</span></td>
          <td>${vehicle.route}</td>
          <td>${vehicle.occupancy_rate || 0}%</td>
          <td><span class="badge bg-success">${vehicle.status}</span></td>
          <td>${vehicle.last_location}</td>
        </tr>
      `).join('');

      document.getElementById('transportationTable').innerHTML = vehiclesHTML || '<tr><td colspan="6" class="text-center text-muted">No vehicles</td></tr>';
    }
  } catch (error) {
    console.error('Error loading transportation data:', error);
  }
}

/**
 * Load Citizen Feedback
 */
async function loadCitizenFeedback() {
  try {
    const response = await makeRequest('/feedback');
    if (response?.success) {
      const feedback = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      // Update counts
      const openCount = feedback.filter(f => f.status === 'open').length;
      const priorityCount = feedback.filter(f => f.priority === 'high' || f.priority === 'critical').length;

      document.getElementById('openTicketsCount').textContent = openCount;
      document.getElementById('priorityFeedbackCount').textContent = priorityCount;

      // Build table
      const feedbackHTML = feedback.map(item => `
        <tr>
          <td>${item.id}</td>
          <td><span class="badge bg-secondary">${item.type}</span></td>
          <td>${item.category}</td>
          <td><span class="badge bg-info">${item.status}</span></td>
          <td><span class="badge bg-${getPriorityColor(item.priority)}">${item.priority}</span></td>
          <td>${formatDate(item.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewFeedback(${item.id})">View</button>
          </td>
        </tr>
      `).join('');

      document.getElementById('feedbackTable').innerHTML = feedbackHTML || '<tr><td colspan="7" class="text-center text-muted">No feedback</td></tr>';
    }
  } catch (error) {
    console.error('Error loading feedback:', error);
  }
}

function getPriorityColor(priority) {
  const colors = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger',
    'critical': 'dark'
  };
  return colors[priority] || 'secondary';
}

/**
 * Load analytics data
 */
async function loadAnalyticsData() {
  try {
    // Load traffic records count
    const trafficResponse = await makeRequest('/traffic-monitoring/latest');
    const trafficCount = trafficResponse?.data ? (Array.isArray(trafficResponse.data) ? trafficResponse.data.length : 1) : 0;
    document.getElementById('totalTrafficRecords').textContent = trafficCount;

    // Load incidents count
    const incidentsResponse = await makeRequest('/incidents');
    const incidents = Array.isArray(incidentsResponse?.data) ? incidentsResponse.data : incidentsResponse?.data?.data || [];
    const activeIncidents = incidents.filter(i => i.status === 'pending' || i.status === 'processing').length;
    document.getElementById('totalIncidents').textContent = activeIncidents;

    // Load feedback count
    const feedbackResponse = await makeRequest('/feedback');
    const feedback = Array.isArray(feedbackResponse?.data) ? feedbackResponse.data : feedbackResponse?.data?.data || [];
    document.getElementById('totalFeedback').textContent = feedback.length;

    // Initialize traffic patterns chart
    initializeTrafficPatternsChart();
  } catch (error) {
    console.error('Error loading analytics data:', error);
  }
}

/**
 * Initialize traffic patterns chart
 */
async function initializeTrafficPatternsChart() {
  try {
    const ctx = document.getElementById('trafficPatternsChart');
    if (!ctx) return;

    // Fetch actual data
    const response = await makeRequest('/traffic-monitoring/pattern?days=7');
    let chartData;

    if (response?.success && response.data && response.data.length > 0) {
      const data = response.data;
      const labels = data.map(d => `${d.hour_of_day}:00`);
      const vehicles = data.map(d => d.avg_vehicles);
      const speeds = data.map(d => d.avg_speed);

      chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Average Vehicles',
            data: vehicles,
            borderColor: '#00ffcc',
            backgroundColor: 'rgba(0, 255, 204, 0.1)',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Average Speed (km/h)',
            data: speeds,
            borderColor: '#f72585',
            backgroundColor: 'rgba(247, 37, 133, 0.1)',
            borderWidth: 2,
            tension: 0.4
          }
        ]
      };
    } else {
      // Fallback empty state
      chartData = {
        labels: ['00:00', '06:00', '12:00', '18:00'],
        datasets: [{
          label: 'No Data Available',
          data: [0, 0, 0, 0],
          borderColor: '#4c6ef5',
          backgroundColor: 'rgba(76, 110, 245, 0.1)'
        }]
      };
    }

    // Destroy existing chart if it exists
    if (window.trafficChartInstance) {
      window.trafficChartInstance.destroy();
    }

    window.trafficChartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#fff' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#fff' }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing traffic patterns chart:', error);
  }
}

async function viewFeedback(id) {
  try {
    const response = await makeRequest(`/feedback/${id}`);
    if (response?.success && response.data) {
      const fb = response.data;
      const modalHtml = `
        <div class="modal fade" id="dynamicFeedbackModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content glass-card border-0 neon-border-info">
              <div class="modal-header border-bottom border-light">
                <h5 class="modal-title">Citizen Feedback</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Type:</strong> ${fb.type || fb.feedback_type}</p>
                <p><strong>Category:</strong> ${fb.category}</p>
                <p><strong>Status:</strong> ${fb.status}</p>
                <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(fb.priority)}">${fb.priority}</span></p>
                <p><strong>Message:</strong> ${fb.message || fb.description}</p>
                <p><strong>Created:</strong> ${formatDate(fb.created_at || fb.submitted_at)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      const oldModal = document.getElementById('dynamicFeedbackModal');
      if (oldModal) oldModal.remove();
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modal = new bootstrap.Modal(document.getElementById('dynamicFeedbackModal'));
      modal.show();
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
  }
}

/**
 * Handle Admin Menu Visibility
 */
function handleAdminMenuVisibility() {
  const adminMenuContainer = document.getElementById('adminMenuContainer');
  const userManagementBtn = document.getElementById('addTrafficLightBtn');
  const createAlertBtn = document.getElementById('createAlertBtn');
  const registerTransportBtn = document.getElementById('registerTransportBtn');
  const reportIncidentBtn = document.getElementById('reportIncidentBtn');

  if (!currentUser) return;

  const role = currentUser.role;

  // Handle Admin Menu visibility (Traffic Lights, Pedestrians, Incidents)
  if (role === 'admin' || role === 'superadmin') {
    if (adminMenuContainer) {
      adminMenuContainer.style.display = 'block';
    }
    if (userManagementBtn) {
      userManagementBtn.style.display = 'block';
    }
  } else {
    if (adminMenuContainer) {
      adminMenuContainer.style.display = 'none';
    }
    if (userManagementBtn) {
      userManagementBtn.style.display = 'none';
    }
  }

  // Handle User Management access (Superadmin only)
  const usersTab = document.querySelector('[data-tab="users"]');
  if (usersTab) {
    if (role === 'superadmin') {
      usersTab.style.display = 'block';
    } else {
      usersTab.style.display = 'none';
    }
  }

  // Handle Create Alert button (Admin and Superadmin)
  if (createAlertBtn) {
    if (role === 'admin' || role === 'superadmin') {
      createAlertBtn.style.display = 'block';
    } else {
      createAlertBtn.style.display = 'none';
    }
  }

  // Handle Register Transport button (Admin and Superadmin)
  if (registerTransportBtn) {
    if (role === 'admin' || role === 'superadmin') {
      registerTransportBtn.style.display = 'block';
    } else {
      registerTransportBtn.style.display = 'none';
    }
  }

  // All users can report incidents and submit feedback
  if (reportIncidentBtn) {
    reportIncidentBtn.style.display = 'block';
  }
}

/**
 * Updated Tab Navigation for New Features
 */
function setupTabNavigationUpdated() {
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      showTab(tabName);
    });
  });
}

async function showTab(tabName) {
  // Hide all tabs with fade out
  document.querySelectorAll('.section-content').forEach(tab => {
    tab.classList.remove('active');
    setTimeout(() => {
      if (!tab.classList.contains('active')) {
        tab.style.display = 'none';
      }
    }, 300);
  });

  const tabIdMap = {
    'emergency-alerts': 'emergencyAlertsTab',
    'air-quality': 'airQualityTab',
    'transportation': 'transportationTab',
    'feedback': 'feedbackTab',
    'analytics': 'analyticsTab',
    'traffic-lights': 'trafficLightsTab',
    'pedestrians': 'pedestriansTab',
    'incidents': 'incidentsTab',
    'users': 'usersTab'
  };

  const tabId = tabIdMap[tabName] || tabName + 'Tab';
  const tabElement = document.getElementById(tabId);
  
  if (tabElement) {
    tabElement.style.display = 'block';
    // Small timeout for CSS transition to trigger after display:block
    setTimeout(() => tabElement.classList.add('active'), 10);

    if (tabName === 'emergency-alerts') {
      showSkeleton('emergencyAlertsTable', 5, 7);
      await loadEmergencyAlerts();
    } else if (tabName === 'air-quality') {
      showSkeleton('airQualityTable', 5, 7);
      await loadAirQualityData();
    } else if (tabName === 'transportation') {
      showSkeleton('transportationTable', 5, 7);
      await loadPublicTransportationData();
    } else if (tabName === 'feedback') {
      showSkeleton('feedbackTable', 5, 7);
      await loadCitizenFeedback();
    } else if (tabName === 'analytics') {
      await loadAnalyticsData();
    } else if (tabName === 'traffic-lights') {
      showSkeletonGrid('trafficLightsContainer', 4);
      await loadTrafficLightsManagement();
    } else if (tabName === 'pedestrians') {
      showSkeletonGrid('pedestriansContainer', 4);
      await loadPedestriansManagement();
    } else if (tabName === 'incidents') {
      showSkeleton('allIncidentsTable', 5, 8);
      await loadIncidentsManagement();
    } else if (tabName === 'users') {
      showSkeleton('usersTable', 5, 7);
      await loadUsersManagement();
    }
  }
}

function showSkeleton(tableBodyId, rows = 3, cols = 5) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += '<tr>';
    for (let j = 0; j < cols; j++) {
      html += '<td><div class="skeleton-cell"></div></td>';
    }
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

function showSkeletonGrid(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="skeleton-cell mb-2" style="height:24px; width:60%;"></div>
            <div class="skeleton-cell mb-3" style="height:16px; width:40%;"></div>
            <div class="skeleton-cell mb-2" style="height:40px; width:100%;"></div>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

/**
 * Handle New Feature Form Submissions
 */
function bindNewFeatureForms() {
  // Air Quality Form
  const addAirQualityForm = document.getElementById('addAirQualityForm');
  if (addAirQualityForm) {
    addAirQualityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const aqiNum = parseInt(document.getElementById('aqIndex').value) || 0;
      let qualityLevel = 'Moderate';
      if (aqiNum <= 50) qualityLevel = 'Good';
      else if (aqiNum <= 100) qualityLevel = 'Moderate';
      else if (aqiNum <= 150) qualityLevel = 'Unhealthy for Sensitive Groups';
      else if (aqiNum <= 200) qualityLevel = 'Unhealthy';
      else if (aqiNum <= 300) qualityLevel = 'Very Unhealthy';
      else qualityLevel = 'Hazardous';

      const formData = {
        location_name: document.getElementById('aqLocation').value,
        latitude: parseFloat(document.getElementById('aqLat').value) || 0,
        longitude: parseFloat(document.getElementById('aqLng').value) || 0,
        aqi: aqiNum,
        quality_level: qualityLevel,
        pm2_5: parseFloat(document.getElementById('aqPM25').value) || null,
        pm10: parseFloat(document.getElementById('aqPM10').value) || null,
        o3: parseFloat(document.getElementById('aqO3').value) || null,
        no2: parseFloat(document.getElementById('aqNO2').value) || null,
        co: parseFloat(document.getElementById('aqCO').value) || null
      };

      const response = await makeRequest('/air-quality/record', {
        method: 'POST',
        body: formData
      });

      if (response?.success) {
        showSuccess('Air Quality data added successfully!');
        addAirQualityForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('addAirQualityModal')).hide();
        await loadAirQualityData();
      } else {
        showError(response?.message || 'Failed to add air quality data');
      }
    });
  }

  // Emergency Alert Form
  const emergencyAlertForm = document.getElementById('emergencyAlertForm');
  if (emergencyAlertForm) {
    emergencyAlertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        alert_type: document.getElementById('alertType').value,
        location_name: document.getElementById('alertLocation').value,
        latitude: 0,
        longitude: 0,
        severity: document.getElementById('alertSeverity').value,
        description: document.getElementById('alertDescription').value
      };

      const response = await makeRequest('/emergency-alerts/create', {
        method: 'POST',
        body: formData
      });

      if (response?.success) {
        showSuccess('Alert created successfully!');
        emergencyAlertForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('emergencyAlertModal')).hide();
        await loadEmergencyAlerts();
      } else {
        showError(response?.message || 'Failed to create alert');
      }
    });
  }

  // Transportation Form
  const transportationForm = document.getElementById('transportationForm');
  if (transportationForm) {
    transportationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        vehicle_type: document.getElementById('vehicleType').value,
        vehicle_number: `VEH-${Date.now()}`,
        route_name: document.getElementById('vehicleRoute').value,
        current_location_lat: 0,
        current_location_lng: 0,
        occupancy_rate: parseInt(document.getElementById('vehicleCapacity').value) || 0
      };

      const response = await makeRequest('/public-transportation/register', {
        method: 'POST',
        body: formData
      });

      if (response?.success) {
        showSuccess('Vehicle registered successfully!');
        transportationForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('transportationModal')).hide();
        await loadPublicTransportationData();
      } else {
        showError(response?.message || 'Failed to register vehicle');
      }
    });
  }

  // Feedback Form
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        type: document.getElementById('feedbackType').value,
        category: document.getElementById('feedbackCategory').value,
        message: document.getElementById('feedbackMessage').value,
        location: document.getElementById('feedbackLocation').value || null,
        title: document.getElementById('feedbackMessage').value.slice(0, 80)
      };

      const response = await makeRequest('/feedback/submit', {
        method: 'POST',
        body: formData
      });

      if (response?.success) {
        showSuccess('Feedback submitted successfully!');
        feedbackForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide();
        await loadCitizenFeedback();
      } else {
        showError(response?.message || 'Failed to submit feedback');
      }
    });
  }
}

async function updateTrafficLight(id) {
  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat memperbarui traffic light.');
  }

  const status = prompt('Masukkan status baru untuk traffic light (green, yellow, red):');
  const duration = prompt('Masukkan durasi status dalam detik:');

  if (!status || !duration) {
    return;
  }

  try {
    const response = await makeRequest(`/traffic-lights/${id}/status`, {
      method: 'PUT',
      body: {
        status,
        duration: Number(duration)
      }
    });

    if (response?.success) {
      await loadTrafficLights();
      await loadTrafficLightsManagement();
    } else {
      showError(response.message || 'Gagal memperbarui traffic light');
    }
  } catch (error) {
    console.error('Error updating traffic light:', error);
    showError('Terjadi kesalahan saat memperbarui traffic light.');
  }
}

async function updatePedestrian(id) {
  if (!isAdminUser(currentUser)) {
    return showError('Hanya admin yang dapat memperbarui pedestrian crossing.');
  }

  const signal = prompt('Masukkan signal baru (walk atau wait):');
  const waitTime = prompt('Masukkan estimasi waktu tunggu (detik):');

  if (!signal || !waitTime) {
    return;
  }

  try {
    const response = await makeRequest(`/pedestrians/${id}/signal`, {
      method: 'PUT',
      body: {
        signal,
        waitTime: Number(waitTime)
      }
    });

    if (response?.success) {
      await loadPedestrianCrossings();
      await loadPedestriansManagement();
    } else {
      showError(response.message || 'Gagal memperbarui pedestrian crossing');
    }
  } catch (error) {
    console.error('Error updating pedestrian crossing:', error);
    showError('Terjadi kesalahan saat memperbarui pedestrian crossing.');
  }
}

/**
 * Helper functions for colors
 */
function getStatusColor(status) {
  const colors = {
    'green': 'success',
    'yellow': 'warning',
    'red': 'danger'
  };
  return colors[status] || 'secondary';
}

function getSeverityColor(severity) {
  const colors = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger',
    'critical': 'dark'
  };
  return colors[severity] || 'secondary';
}

function getIncidentStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'processing': 'info',
    'resolved': 'success',
    'closed': 'secondary'
  };
  return colors[status] || 'secondary';
}
