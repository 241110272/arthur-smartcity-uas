// Utility functions for API calls and storage
const API_BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function getUser() {
  const user = localStorage.getItem('userData');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('userData', JSON.stringify(user));
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
  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  }

  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await makeRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        if (response.success) {
          const { token, user } = response.data;
          
          // Store token and user data
          setToken(token);
          setUser(user);

          // Show success message
          if (successMessage) {
            successMessage.textContent = 'Login berhasil! Redirecting...';
            successMessage.style.display = 'block';
          }

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          const errorMsg = response.message || 'Email atau password salah';
          if (errorMessage) {
            errorMessage.textContent = errorMsg;
            errorMessage.style.display = 'block';
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        if (errorMessage) {
          errorMessage.textContent = 'Terjadi kesalahan. Silahkan coba lagi.';
          errorMessage.style.display = 'block';
        }
      }
    });
  }

  // Check if already logged in
  if (isAuthenticated()) {
    window.location.href = '/dashboard';
  }
});
