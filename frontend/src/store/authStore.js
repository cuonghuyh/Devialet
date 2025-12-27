import { create } from 'zustand';
import { authAPI } from '../api/auth';

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  token: sessionStorage.getItem('token') || null,
  isAuthenticated: !!sessionStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true };
      }
    } catch (error) {
      const response = error.response?.data;
      const message = response?.message || 'Login failed';
      
      set({ error: message, loading: false });
      
      // Return requires_verification if present
      if (response?.requires_verification) {
        return { 
          success: false, 
          message,
          requires_verification: true,
          email: response.email
        };
      }
      
      return { success: false, message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.register(userData);
      if (data.success) {
        // Check if email verification is required
        if (data.requires_verification) {
          set({ loading: false });
          return { 
            success: true, 
            requires_verification: true,
            email: data.email,
            message: data.message 
          };
        }
        
        // Old flow - auto login (if verification not required)
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true };
      }
    } catch (error) {
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
      // Silent error handling
    } finally {
      // Clear sessionStorage first
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Update auth state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        loading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
