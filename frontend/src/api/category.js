import api from './axios';

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};
