import api from './axios';

export const contactAPI = {
  submit: async (data) => {
    const response = await api.post('/contact', data);
    return response.data;
  }
};
