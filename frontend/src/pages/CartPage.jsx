import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { productsAPI } from '../api/products';
import CheckoutSection from '../components/CheckoutSection';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { 
    items, 
    itemCount, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getTotal 
  } = useCartStore();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch product details for cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const productPromises = items.map(async (item) => {
          // If product info is already stored, use it
          if (item.product && item.product.name) {
            return {
              ...item,
              product: item.product
            };
          }
          
          // Otherwise fetch from API
          try {
            const data = await productsAPI.getProduct(item.productId);
            return {
              ...item,
              product: data.product || data
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            return {
              ...item,
              product: null
            };
          }
        });

        const fetchedItems = await Promise.all(productPromises);
        setCartItems(fetchedItems.filter(item => item.product));
        setSelectedItems(fetchedItems.filter(item => item.product).map(item => item.productId));
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [items]);

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      showNotification(`Chỉ còn ${maxStock} sản phẩm trong kho`, 'error');
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
    showNotification(`Đã xóa "${productName}" khỏi giỏ hàng`);
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      clearCart();
      setSelectedItems([]);
      showNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.productId));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để thanh toán', 'error');
      navigate('/auth');
      return;
    }
    
    if (selectedItems.length === 0) {
      showNotification('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán', 'error');
      return;
    }
    
    setShowCheckout(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Calculate totals for selected items
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.productId));
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const shippingFee = subtotal > 0 ? 0 : 0; // Free shipping
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Show Checkout Section when showCheckout is true
  if (showCheckout) {
    return (
      <div className="cart-page">
        {/* Notification */}
        {notification && (
          <div className={`cart-notification ${notification.type}`}>
            {notification.type === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            {notification.message}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <div className="breadcrumb-container">
            <Link to="/">Trang chủ</Link>
            <span className="separator">›</span>
            <Link to="/products">Sản phẩm</Link>
            <span className="separator">›</span>
            <button onClick={() => setShowCheckout(false)} className="breadcrumb-link">Giỏ hàng</button>
            <span className="separator">›</span>
            <span className="current">Thanh toán</span>
          </div>
        </div>

        <div className="cart-container">
          <CheckoutSection
            cartItems={selectedCartItems}
            total={total}
            onBack={() => setShowCheckout(false)}
            onCheckoutSuccess={(order) => {
              selectedItems.forEach(id => removeFromCart(id));
              setShowCheckout(false);
              const paymentStatus = order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán';
              showNotification(`Đặt hàng thành công! ${paymentStatus}`, 'success');
              navigate('/orders');
            }}
            removeFromCart={removeFromCart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Notification */}
      {notification && (
        <div className={`cart-notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="cart-breadcrumb">
        <div className="breadcrumb-container">
          <Link to="/">Trang chủ</Link>
          <span className="separator">›</span>
          <Link to="/products">Sản phẩm</Link>
          <span className="separator">›</span>
          <span className="current">Giỏ hàng</span>
        </div>
      </div>

      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Giỏ hàng của bạn
          </h1>
          <span className="cart-count">{itemCount} sản phẩm</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="continue-shopping-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              {/* Select All & Clear */}
              <div className="cart-actions-bar">
                <label className="select-all">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                </label>
                <button className="clear-cart-btn" onClick={handleClearCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Xóa tất cả
                </button>
              </div>

              {/* Cart Items List */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.productId} className={`cart-item ${selectedItems.includes(item.productId) ? 'selected' : ''}`}>
                    <div className="item-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.productId)}
                        onChange={() => handleSelectItem(item.productId)}
                      />
                    </div>
                    
                    <div className="item-image" onClick={() => navigate(`/products/${item.productId}`)}>
                      <img 
                        src={item.product?.image_url || item.product?.image || '/images/placeholder.jpg'} 
                        alt={item.product?.name} 
                      />
                    </div>
                    
                    <div className="item-details">
                      <h3 
                        className="item-name"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.product?.name}
                      </h3>
                      <p className="item-category">{item.product?.category?.name || 'Devialet'}</p>
                      
                      {item.product?.stock <= 5 && item.product?.stock > 0 && (
                        <span className="low-stock-warning">
                          Chỉ còn {item.product.stock} sản phẩm
                        </span>
                      )}
                    </div>
                    
                    <div className="item-price">
                      {item.product?.discount_price ? (
                        <>
                          <span className="current-price">${formatPrice(item.product.discount_price)}</span>
                          <span className="original-price">${formatPrice(item.product.price)}</span>
                        </>
                      ) : (
                        <span className="current-price">${formatPrice(item.product?.price)}</span>
                      )}
                    </div>
                    
                    <div className="item-quantity">
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.product?.stock)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.product?.stock)}
                        disabled={item.quantity >= item.product?.stock}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      ${formatPrice((item.product?.discount_price || item.product?.price) * item.quantity)}
                    </div>
                    
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.productId, item.product?.name)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h2>Tóm tắt đơn hàng</h2>
                
                <div className="summary-row">
                  <span>Sản phẩm đã chọn</span>
                  <span>{selectedItems.length} sản phẩm</span>
                </div>
                
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span className="free-shipping">Miễn phí</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <span className="total-price">${formatPrice(total)}</span>
                </div>
                
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Tiến hành thanh toán
                </button>
                
                <Link to="/products" className="continue-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Tiếp tục mua sắm
                </Link>
                
                <div className="summary-benefits">
                  <div className="benefit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <div className="benefit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    <span>Đổi trả trong 30 ngày</span>
                  </div>
                  <div className="benefit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Bảo hành chính hãng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
