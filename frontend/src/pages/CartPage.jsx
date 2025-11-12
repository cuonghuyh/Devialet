import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutModal from '../components/CheckoutModal';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [notification, setNotification] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    const result = await updateQuantity(itemId, newQuantity);
    setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    
    if (result.success) {
      showNotification('✓ Đã cập nhật số lượng', 'success');
    } else {
      showNotification('❌ Không thể cập nhật số lượng', 'error');
    }
  };

  const handleRemoveItem = async (itemId, productName) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    const result = await removeItem(itemId);
    if (result.success) {
      showNotification(`✓ Đã xóa ${productName} khỏi giỏ hàng`, 'success');
    } else {
      showNotification('❌ Không thể xóa sản phẩm', 'error');
    }
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = (order) => {
    showNotification(`✓ Order ${order.order_number} placed successfully!`, 'success');
    fetchCart(); // Refresh cart (should be empty now)
    setTimeout(() => {
      navigate('/'); // Redirect to home or orders page
    }, 2000);
  };

  if (loading && items.length === 0) {
    return (
      <div className="cart-page loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Notification */}
      {notification && (
        <div className={`cart-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ Hàng Của Bạn</h1>
          <p>Quản lý các sản phẩm bạn muốn mua</p>
        </div>

        <div className="cart-content">
          {items.length > 0 ? (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} />
                      ) : (
                        <div className="placeholder-image">📦</div>
                      )}
                    </div>
                    <div className="item-details">
                      <div className="item-category">
                        {item.product?.category?.name || 'Product'}
                      </div>
                      <div className="item-name">{item.product?.name}</div>
                      <div className="item-price">${Number(item.price).toFixed(2)}</div>
                      <div className="item-actions">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems[item.id] || item.quantity <= 1}
                          >
                            −
                          </button>
                          <div className="quantity-display">{item.quantity}</div>
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems[item.id]}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.id, item.product?.name)}
                          disabled={updatingItems[item.id]}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3 className="summary-title">Tổng Kết</h3>
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Thanh Toán
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ Hàng Trống</h3>
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <button className="shop-now-btn" onClick={() => navigate('/products')}>
                Mua Sắm Ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={items}
        total={total}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default CartPage;
