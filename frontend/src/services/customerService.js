import api from './api';

export const customerService = {
  async getAdminCustomers(params = {}) {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  async getAdminCustomer(id) {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  async updateCustomer(id, data) {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data;
  }
};
