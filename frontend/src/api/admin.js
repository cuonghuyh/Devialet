import api from './axios';

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Product management
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, formData) => api.post(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (id, stockQuantity) => api.patch(`/admin/products/${id}/stock`, { stock_quantity: stockQuantity }),

  // Order management
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),

  // Review management
  getReviews: (params) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};
