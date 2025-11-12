import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.register(userData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error.response?.data); // Debug log
      const message = error.response?.data?.message || error.response?.data?.errors || 'Registration failed';
      // If errors is an object, convert to string
      const errorText = typeof message === 'object' 
        ? Object.values(message).flat().join(', ')
        : message;
      set({ error: errorText, loading: false });
      return { success: false, message: errorText };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
