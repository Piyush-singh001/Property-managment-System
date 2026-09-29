import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('pms_token', response.data.access_token);
      localStorage.setItem('pms_admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('pms_token');
      localStorage.removeItem('pms_admin');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getCurrentAdmin() {
    const raw = localStorage.getItem('pms_admin');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('pms_token');
  }
};
