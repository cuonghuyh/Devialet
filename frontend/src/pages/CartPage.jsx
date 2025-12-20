import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [notification, setNotification] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_email: '',
    payment_method: 'cod',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Đã bỏ initialLoading, chỉ dùng loading từ store

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
    
    // Trigger animation
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    const result = await updateQuantity(itemId, newQuantity);
    
    // Remove animation after 400ms
    setTimeout(() => {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }, 400);
    
    if (!result.success) {
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
    setIsClosing(false);
    setShowCheckoutForm(true);
  };

  const handleBackToCart = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCheckoutForm(false);
      setIsClosing(false);
    }, 500); // Match animation duration
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Vui lòng nhập họ tên';
    }
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.customer_address.trim()) {
      newErrors.customer_address = 'Vui lòng nhập địa chỉ';
    }
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email không hợp lệ';
    }
    return newErrors;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification(`✓ Đơn hàng ${data.order.order_number} đã được tạo thành công!`, 'success');
        fetchCart();
        setShowCheckoutForm(false);
        setFormData({
          customer_name: '',
          customer_phone: '',
          customer_address: '',
          customer_email: '',
          payment_method: 'cod',
          note: '',
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Không thể tạo đơn hàng' });
        showNotification('❌ ' + (data.error || 'Không thể tạo đơn hàng'), 'error');
      }
    } catch (error) {
      setErrors({ submit: 'Lỗi kết nối. Vui lòng thử lại.' });
      showNotification('❌ Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page loading-page">
        <div className="loading-content">
          <div className="spinner"></div>
          <p style={{ color: 'rgba(212, 165, 116, 0.8)', marginTop: '1rem' }}>Đang tải giỏ hàng...</p>
        </div>
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
              {!showCheckoutForm ? (
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
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <div className={`quantity-display ${updatingItems[item.id] ? 'updating' : ''}`}>
                                {item.quantity}
                              </div>
                              <button
                                className="quantity-btn"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveItem(item.id, item.product?.name)}
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
                <div className={`checkout-form-full-width ${isClosing ? 'closing' : ''}`}>
                  <div className="checkout-header">
                    <button className="back-btn" onClick={handleBackToCart}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                      </svg>
                      <span>Quay Lại Giỏ Hàng</span>
                    </button>
                    <h2>Thông Tin Thanh Toán</h2>
                  </div>

                  <div className="checkout-grid">
                    <div className="checkout-left">
                      <form onSubmit={handleSubmitOrder} className="checkout-form-expanded">
                        <div className="form-section">
                          <h3>Thông Tin Giao Hàng</h3>
                          
                          <div className="form-group">
                            <label>Họ và Tên *</label>
                            <input
                              type="text"
                              name="customer_name"
                              value={formData.customer_name}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A"
                              className={errors.customer_name ? 'error' : ''}
                            />
                            {errors.customer_name && <span className="error-text">{errors.customer_name}</span>}
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Số Điện Thoại *</label>
                              <input
                                type="tel"
                                name="customer_phone"
                                value={formData.customer_phone}
                                onChange={handleChange}
                                placeholder="0912345678"
                                className={errors.customer_phone ? 'error' : ''}
                              />
                              {errors.customer_phone && <span className="error-text">{errors.customer_phone}</span>}
                            </div>

                            <div className="form-group">
                              <label>Email (Tùy chọn)</label>
                              <input
                                type="email"
                                name="customer_email"
                                value={formData.customer_email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className={errors.customer_email ? 'error' : ''}
                              />
                              {errors.customer_email && <span className="error-text">{errors.customer_email}</span>}
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Địa Chỉ Giao Hàng *</label>
                            <textarea
                              name="customer_address"
                              value={formData.customer_address}
                              onChange={handleChange}
                              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                              rows="3"
                              className={errors.customer_address ? 'error' : ''}
                            />
                            {errors.customer_address && <span className="error-text">{errors.customer_address}</span>}
                          </div>

                          <div className="form-group">
                            <label>Ghi Chú</label>
                            <textarea
                              name="note"
                              value={formData.note}
                              onChange={handleChange}
                              placeholder="Thời gian giao hàng, địa chỉ cụ thể..."
                              rows="2"
                            />
                          </div>
                        </div>

                        <div className="form-section">
                          <h3>Phương Thức Thanh Toán</h3>
                          <div className="payment-methods">
                            <label className={`payment-option ${formData.payment_method === 'cod' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                value="cod"
                                checked={formData.payment_method === 'cod'}
                                onChange={handleChange}
                              />
                              <div className="payment-option-content">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                                  <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                <div>
                                  <strong>COD</strong>
                                  <span>Thanh toán khi nhận hàng</span>
                                </div>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.payment_method === 'momo' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                value="momo"
                                checked={formData.payment_method === 'momo'}
                                onChange={handleChange}
                              />
                              <div className="payment-option-content">
                                <div className="payment-icon momo">
                                  <svg viewBox="0 0 48 48" width="48" height="48">
                                    <circle cx="24" cy="24" r="20"/>
                                    <text x="24" y="32" textAnchor="middle">M</text>
                                  </svg>
                                </div>
                                <div>
                                  <strong>MoMo</strong>
                                  <span>Thanh toán qua ví MoMo</span>
                                </div>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.payment_method === 'vietqr' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                value="vietqr"
                                checked={formData.payment_method === 'vietqr'}
                                onChange={handleChange}
                              />
                              <div className="payment-option-content">
                                <div className="payment-icon vietqr">
                                  <svg viewBox="0 0 48 48" width="48" height="48">
                                    <rect x="8" y="8" width="8" height="8"/>
                                    <rect x="20" y="8" width="8" height="8"/>
                                    <rect x="32" y="8" width="8" height="8"/>
                                    <rect x="8" y="20" width="8" height="8"/>
                                    <rect x="20" y="20" width="8" height="8"/>
                                    <rect x="32" y="20" width="8" height="8"/>
                                    <rect x="8" y="32" width="8" height="8"/>
                                    <rect x="20" y="32" width="8" height="8"/>
                                    <rect x="32" y="32" width="8" height="8"/>
                                  </svg>
                                </div>
                                <div>
                                  <strong>VietQR</strong>
                                  <span>Quét mã QR thanh toán</span>
                                </div>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.payment_method === 'bank_transfer' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                value="bank_transfer"
                                checked={formData.payment_method === 'bank_transfer'}
                                onChange={handleChange}
                              />
                              <div className="payment-option-content">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                  <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <div>
                                  <strong>Chuyển Khoản</strong>
                                  <span>Chuyển khoản ngân hàng</span>
                                </div>
                              </div>
                            </label>

                            <label className={`payment-option ${formData.payment_method === 'credit_card' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="payment_method"
                                value="credit_card"
                                checked={formData.payment_method === 'credit_card'}
                                onChange={handleChange}
                              />
                              <div className="payment-option-content">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                                  <line x1="1" y1="10" x2="23" y2="10"/>
                                </svg>
                                <div>
                                  <strong>Thẻ Tín Dụng</strong>
                                  <span>Visa, Mastercard</span>
                                </div>
                              </div>
                            </label>
                          </div>

                          {formData.payment_method === 'momo' && (
                            <div className="payment-instruction">
                              <p>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="16" x2="12" y2="12"/>
                                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Hướng dẫn thanh toán MoMo:
                              </p>
                              <ol>
                                <li>Sau khi đặt hàng, bạn sẽ nhận được link thanh toán</li>
                                <li>Mở app MoMo và xác nhận thanh toán</li>
                                <li>Đơn hàng sẽ được xác nhận sau khi thanh toán thành công</li>
                              </ol>
                            </div>
                          )}

                          {formData.payment_method === 'vietqr' && (
                            <div className="payment-instruction">
                              <p>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="16" x2="12" y2="12"/>
                                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Hướng dẫn thanh toán VietQR:
                              </p>
                              <ol>
                                <li>Sau khi đặt hàng, mã QR sẽ được hiển thị</li>
                                <li>Mở app ngân hàng của bạn</li>
                                <li>Quét mã QR để thanh toán</li>
                                <li>Xác nhận chuyển khoản, đơn hàng sẽ được xử lý trong 5 phút</li>
                              </ol>
                            </div>
                          )}
                        </div>

                        {errors.submit && (
                          <div className="error-message-box">{errors.submit}</div>
                        )}
                      </form>
                    </div>

                    <div className="checkout-right">
                      <div className="order-summary-expanded">
                        <h3>Đơn Hàng Của Bạn</h3>
                        
                        <div className="summary-items">
                          {items.map((item) => (
                            <div key={item.id} className="summary-item">
                              <div className="summary-item-image">
                                {item.product?.image_url ? (
                                  <img src={item.product.image_url} alt={item.product.name} />
                                ) : (
                                  <div className="placeholder">📦</div>
                                )}
                              </div>
                              <div className="summary-item-info">
                                <div className="summary-item-name">{item.product?.name}</div>
                                <div className="summary-item-qty">Số lượng: {item.quantity}</div>
                              </div>
                              <div className="summary-item-price">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="summary-totals">
                          <div className="summary-row">
                            <span>Tạm tính</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                          <div className="summary-row">
                            <span>Phí vận chuyển</span>
                            <span className="free">Miễn phí</span>
                          </div>
                          <div className="summary-row total">
                            <span>Tổng cộng</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={handleSubmitOrder}
                          className="submit-order-btn-expanded"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default CartPage;
