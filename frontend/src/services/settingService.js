import api from './api';

export const settingService = {
  async getPublicSettings() {
    const response = await api.get('/settings/public');
    return response.data;
  },

  async getAdminSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateAdminSettings(data) {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  async getAmenities() {
    const response = await api.get('/amenities');
    return response.data;
  }
};
