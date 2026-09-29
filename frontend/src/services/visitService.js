import api from './api';

export const visitService = {
  async bookPublicVisit(data) {
    const response = await api.post('/visits', data);
    return response.data;
  },

  async getAdminVisits(params = {}) {
    const response = await api.get('/admin/visits', { params });
    return response.data;
  },

  async getVisitDetail(id) {
    const response = await api.get(`/admin/visits/${id}`);
    return response.data;
  },

  async updateStatus(id, data) {
    const response = await api.patch(`/admin/visits/${id}/status`, data);
    return response.data;
  }
};
