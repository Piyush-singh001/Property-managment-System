import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    let message = 'An unexpected error occurred. Please try again.';
    
    if (errorData?.message) {
      message = errorData.message;
    } else if (errorData?.detail) {
      if (typeof errorData.detail === 'string') {
        message = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        message = errorData.detail.map((d) => d.msg || d.message).join(', ');
      }
    }
    
    // Automatically redirect on 401 for admin routes
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_admin');
      window.location.href = '/admin/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
