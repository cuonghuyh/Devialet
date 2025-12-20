import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { InteractiveCheckout } from '../components/ui/InteractiveCheckout';
import './CartPage.css';

const CartPageNew = () => {
  const navigate = useNavigate();
  const { items, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    // Transform backend cart items to InteractiveCheckout format
    const transformedItems = items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: parseFloat(item.product.price),
      quantity: item.quantity,
      category: item.product.category,
      image: item.product.image_url || 'https://via.placeholder.com/150',
    }));
    setCartItems(transformedItems);
  }, [items]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUpdateCart = async (updatedCart) => {
    try {
      // Find the difference and update backend
      for (const item of updatedCart) {
        const existingItem = cartItems.find(i => i.id === item.id);
        if (!existingItem || existingItem.quantity !== item.quantity) {
          await updateQuantity(item.id, item.quantity);
        }
      }
      
      // Handle removed items
      for (const item of cartItems) {
        if (!updatedCart.find(i => i.id === item.id)) {
          await removeItem(item.id);
        }
      }
      
      setCartItems(updatedCart);
      fetchCart(); // Refresh from backend
    } catch (error) {
      showNotification('❌ Không thể cập nhật giỏ hàng', 'error');
      console.error('Cart update error:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      if (cartItems.length === 0) {
        showNotification('❌ Giỏ hàng trống', 'error');
        return;
      }

      // Navigate to checkout or show checkout form
      navigate('/checkout');
    } catch (error) {
      showNotification('❌ Có lỗi xảy ra', 'error');
      console.error('Checkout error:', error);
    }
  };

  if (!items.length && cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <button onClick={() => navigate('/products')} className="btn-continue">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <button onClick={() => navigate('/products')} className="btn-back">
          ← Tiếp tục mua sắm
        </button>
      </div>

      <InteractiveCheckout
        products={[]} // Empty because we're showing cart only
        cart={cartItems}
        onUpdateCart={handleUpdateCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default CartPageNew;
