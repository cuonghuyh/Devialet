import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewAPI = {
  // Lấy danh sách reviews của sản phẩm
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  // Kiểm tra user đã review chưa
  checkUserReview: async (productId) => {
    const response = await api.get(`/products/${productId}/my-review`);
    return response.data;
  },

  // Tạo review mới
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Cập nhật review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Xóa review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Lấy danh sách sản phẩm có thể review
  getReviewableProducts: async () => {
    const response = await api.get('/reviews/reviewable-products');
    return response.data;
  },

  // Lấy danh sách product IDs đã review
  getMyReviewedProducts: async () => {
    const response = await api.get('/reviews/my-reviewed-products');
    return response.data;
  },
};
