import api from './api';

export const propertyService = {
  // Public
  async getPublicProperties(params = {}) {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  async getPublicPropertyDetail(code) {
    const response = await api.get(`/properties/${code}`);
    return response.data;
  },

  // Admin
  async getAdminProperties(params = {}) {
    const response = await api.get('/admin/properties', { params });
    return response.data;
  },

  async getAdminPropertyDetail(id) {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data;
  },

  async createProperty(data) {
    const response = await api.post('/admin/properties', data);
    return response.data;
  },

  async updateProperty(id, data) {
    const response = await api.put(`/admin/properties/${id}`, data);
    return response.data;
  },

  async updatePropertyStatus(id, property_status) {
    const response = await api.patch(`/admin/properties/${id}/status`, { property_status });
    return response.data;
  },

  async updatePublicationStatus(id, publication_status) {
    const response = await api.patch(`/admin/properties/${id}/publication`, { publication_status });
    return response.data;
  },

  async archiveProperty(id) {
    const response = await api.delete(`/admin/properties/${id}`);
    return response.data;
  },

  async restoreProperty(id) {
    const response = await api.post(`/admin/properties/${id}/restore`);
    return response.data;
  },

  async duplicateProperty(id) {
    const response = await api.post(`/admin/properties/${id}/duplicate`);
    return response.data;
  },

  async reorderImages(propertyId, items) {
    const response = await api.post(`/admin/properties/${propertyId}/images/reorder`, items);
    return response.data;
  },

  async deleteImage(propertyId, imageId) {
    const response = await api.delete(`/admin/properties/${propertyId}/images/${imageId}`);
    return response.data;
  },

  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
