import { create } from 'zustand';
import { cartAPI } from '../api/cart';

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  total: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const data = await cartAPI.getCart();
      const items = data.items || [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      set({
        items,
        itemCount,
        total,
        loading: false
      });
    } catch (error) {
      set({ error: 'Failed to load cart', loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const data = await cartAPI.addToCart(productId, quantity);
      if (data.success) {
        await get().fetchCart();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const data = await cartAPI.updateQuantity(itemId, quantity);
      if (data.success) {
        await get().fetchCart();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      const data = await cartAPI.removeItem(itemId);
      if (data.success) {
        await get().fetchCart();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  clearError: () => set({ error: null })
}));

export default useCartStore;
