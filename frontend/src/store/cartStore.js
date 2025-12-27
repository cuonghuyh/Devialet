import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      
      // Add item to cart
      addToCart: async (productId, quantity = 1, product = null) => {
        try {
          const { items } = get();
          const existingItemIndex = items.findIndex(item => item.productId === productId);
          
          let newItems;
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = items.map((item, index) => 
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [...items, { 
              productId, 
              quantity,
              product, // Store product info for display
              addedAt: new Date().toISOString()
            }];
          }
          
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          
          set({ items: newItems, itemCount: newItemCount });
          
          return { success: true };
        } catch (error) {
          console.error('Error adding to cart:', error);
          return { success: false, message: 'Không thể thêm sản phẩm vào giỏ hàng' };
        }
      },
      
      // Remove item from cart
      removeFromCart: (productId) => {
        const { items } = get();
        const newItems = items.filter(item => item.productId !== productId);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ items: newItems, itemCount: newItemCount });
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const { items } = get();
        const newItems = items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ items: newItems, itemCount: newItemCount });
      },
      
      // Get cart total
      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const price = item.product?.price || 0;
          return sum + (price * item.quantity);
        }, 0);
      },
      
      // Clear cart
      clearCart: () => {
        set({ items: [], itemCount: 0 });
      },
      
      // Get item by product ID
      getItem: (productId) => {
        const { items } = get();
        return items.find(item => item.productId === productId);
      }
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items, itemCount: state.itemCount }),
    }
  )
);

export default useCartStore;
