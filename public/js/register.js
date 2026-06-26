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

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Handle register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const fullName = document.getElementById('fullName').value;
      const phone = document.getElementById('phone').value;

      // Validation
      if (password.length < 8) {
        if (errorMessage) {
          errorMessage.textContent = 'Password harus minimal 8 karakter';
          errorMessage.style.display = 'block';
        }
        return;
      }

      if (password !== confirmPassword) {
        if (errorMessage) {
          errorMessage.textContent = 'Password dan konfirmasi password tidak sesuai';
          errorMessage.style.display = 'block';
        }
        return;
      }

      try {
        const response = await makeRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            email,
            password,
            confirmPassword,
            full_name: fullName,
            phone
          })
        });

        if (response.success) {
          if (successMessage) {
            successMessage.textContent = 'Registrasi berhasil! Redirecting ke login...';
            successMessage.style.display = 'block';
          }

          // Clear form
          registerForm.reset();

          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          const errorMsg = response.message || 'Registrasi gagal';
          if (errorMessage) {
            errorMessage.textContent = errorMsg;
            errorMessage.style.display = 'block';
          }
        }
      } catch (error) {
        console.error('Register error:', error);
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
