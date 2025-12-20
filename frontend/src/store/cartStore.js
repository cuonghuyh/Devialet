import { create } from 'zustand';
import { cartAPI } from '../api/cart';

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  total: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    // Don't fetch cart if user is not authenticated
    if (!localStorage.getItem('token')) {
      set({ items: [], itemCount: 0, total: 0, loading: false });
      return;
    }
    set({ loading: true, error: null });
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      set({ loading: false, error: 'Không thể kết nối tới server. Vui lòng thử lại.' });
    }, 3000);
    try {
      const data = await cartAPI.getCart();
      if (didTimeout) return; // Nếu đã timeout thì không set lại nữa
      clearTimeout(timeout);
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
      if (didTimeout) return;
      clearTimeout(timeout);
      set({ error: 'Không thể tải giỏ hàng', loading: false, items: [], itemCount: 0, total: 0 });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    // Không set loading để UI không bị khựng
    set({ error: null });
    try {
      const data = await cartAPI.addToCart(productId, quantity);
      if (data.success) {
        // Fetch cart ở background, không block UI
        get().fetchCart();
        return { success: true };
      } else {
        const message = data.message || 'Không thể thêm sản phẩm vào giỏ hàng';
        set({ error: message });
        return { success: false, message };
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      const message = error.response?.data?.message || error.message || 'Lỗi kết nối. Vui lòng kiểm tra backend đã chạy chưa.';
      set({ error: message });
      return { success: false, message };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    // Optimistic update - cập nhật UI ngay lập tức
    const { items } = get();
    const oldItems = [...items];
    
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    set({ items: updatedItems, itemCount, total });
    
    // Call API ở background
    try {
      const data = await cartAPI.updateQuantity(itemId, quantity);
      if (data.success) {
        return { success: true };
      } else {
        // Revert nếu API fail
        const itemCount = oldItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = oldItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items: oldItems, itemCount, total, error: 'Failed to update' });
        return { success: false };
      }
    } catch (error) {
      // Revert nếu API fail
      const itemCount = oldItems.reduce((sum, item) => sum + item.quantity, 0);
      const total = oldItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const message = error.response?.data?.message || 'Failed to update quantity';
      set({ items: oldItems, itemCount, total, error: message });
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

  clearCart: () => {
    set({
      items: [],
      itemCount: 0,
      total: 0,
      loading: false,
      error: null
    });
  },

  clearError: () => set({ error: null })
}));

export default useCartStore;
