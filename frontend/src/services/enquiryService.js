import api from './api';

export const enquiryService = {
  async submitPublicEnquiry(data) {
    const response = await api.post('/enquiries', data);
    return response.data;
  },

  async getAdminEnquiries(params = {}) {
    const response = await api.get('/admin/enquiries', { params });
    return response.data;
  },

  async getEnquiryDetail(id) {
    const response = await api.get(`/admin/enquiries/${id}`);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/admin/enquiries/${id}/status`, { status });
    return response.data;
  },

  async addNote(id, note) {
    const response = await api.post(`/admin/enquiries/${id}/notes`, { note });
    return response.data;
  }
};
