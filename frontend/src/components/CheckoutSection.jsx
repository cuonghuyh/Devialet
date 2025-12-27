import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import './CheckoutSection.css';

// VietQR bank codes - common banks
const BANK_INFO = {
  bankId: 'MB', // MB Bank - you can change to your bank
  accountNo: '0385883358', // Your account number
  accountName: 'DEVIALET STORE', // Account holder name
  template: 'compact1', // QR template style
};

// Backend proxy API for payment check (avoids CORS issues)
const PAYMENT_CHECK_API = 'http://localhost:8000/api/payment/check';

const CheckoutSection = ({ cartItems, total, onBack, onCheckoutSuccess, removeFromCart }) => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();
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
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const paymentCheckInterval = useRef(null);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      setFormData(prev => ({
        ...prev,
        customer_name: fullName || user.name || '',
        customer_phone: user.phone || '',
        customer_email: user.email || '',
        customer_address: user.address || '',
      }));
    }
  }, [user]);

  // Generate random order number for transfer description
  useEffect(() => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(`DV${randomNum}`);
    setPaymentVerified(false);
  }, []);

  // Auto-check payment when VietQR is selected
  useEffect(() => {
    if (formData.payment_method === 'vietqr' && !paymentVerified) {
      startPaymentCheck();
    } else {
      stopPaymentCheck();
    }

    return () => stopPaymentCheck();
  }, [formData.payment_method, orderNumber]);

  const startPaymentCheck = () => {
    if (paymentCheckInterval.current) return;
    
    setCheckingPayment(true);
    // Check every 3 seconds
    paymentCheckInterval.current = setInterval(() => {
      checkPaymentStatus();
    }, 3000);
    
    // Also check immediately
    checkPaymentStatus();
  };

  const stopPaymentCheck = () => {
    if (paymentCheckInterval.current) {
      clearInterval(paymentCheckInterval.current);
      paymentCheckInterval.current = null;
    }
    setCheckingPayment(false);
  };

  const checkPaymentStatus = async () => {
    if (paymentVerified) {
      stopPaymentCheck();
      return;
    }

    try {
      const response = await fetch(PAYMENT_CHECK_API);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const lastPaid = data.data[data.data.length - 1];
        const lastPrice = lastPaid["Giá trị"];
        const lastContent = lastPaid["Mô tả"];
        
        const requiredAmount = Math.round(total);
        
        // Check if payment matches (amount >= total and content includes order number)
        if (lastPrice >= requiredAmount && lastContent.includes(orderNumber)) {
          setPaymentVerified(true);
          setShowSuccessPopup(true);
          stopPaymentCheck();
        }
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  // Generate VietQR URL
  const generateVietQRUrl = () => {
    const amount = Math.round(total);
    const description = `Thanh toan don hang ${orderNumber}`;
    
    const url = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
    
    return url;
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
      newErrors.customer_address = 'Vui lòng nhập địa chỉ giao hàng';
    }
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email không hợp lệ';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const cart_items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      
      const response = await fetch('http://localhost:8000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          cart_items,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        clearCart();
        onCheckoutSuccess(data.order);
        setTimeout(() => {
          navigate('/products');
        }, 500);
      } else {
        setErrors({ submit: data.error || 'Đặt hàng thất bại. Vui lòng thử lại.' });
      }
    } catch (error) {
      setErrors({ submit: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="checkout-section">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="payment-success-popup-overlay">
          <div className="payment-success-popup">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p>Đơn hàng <strong>{orderNumber}</strong> đã được thanh toán thành công.</p>
            <p className="success-amount">{formatPrice(Math.round(total))} VNĐ</p>
            <button 
              className="success-popup-btn"
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const token = sessionStorage.getItem('token');
                  const cart_items = cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                  }));
                  
                  const response = await fetch('http://localhost:8000/api/orders/checkout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      ...formData,
                      cart_items,
                    }),
                  });

                  const data = await response.json();

                  if (response.ok && data.success) {
                    clearCart();
                    setShowSuccessPopup(false);
                    navigate('/orders');
                  }
                } catch (error) {
                  console.error('Failed to create order:', error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button className="checkout-back-btn" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Quay lại giỏ hàng
      </button>

      <div className="checkout-content">
        <div className="checkout-form-section">
          <div className="checkout-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Thông tin thanh toán
            </h2>
            <p>Vui lòng điền thông tin giao hàng</p>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Thông tin khách hàng</h3>
              
              <div className="form-group">
                <label htmlFor="customer_name">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className={errors.customer_name ? 'error' : ''}
                />
                {errors.customer_name && <span className="error-message">{errors.customer_name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer_phone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className={errors.customer_phone ? 'error' : ''}
                  />
                  {errors.customer_phone && <span className="error-message">{errors.customer_phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="customer_email">Email (Không bắt buộc)</label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={errors.customer_email ? 'error' : ''}
                  />
                  {errors.customer_email && <span className="error-message">{errors.customer_email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer_address">
                  Địa chỉ giao hàng <span className="required">*</span>
                </label>
                <textarea
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ giao hàng đầy đủ"
                  rows="3"
                  className={errors.customer_address ? 'error' : ''}
                />
                {errors.customer_address && <span className="error-message">{errors.customer_address}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Phương thức thanh toán</h3>
              
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <div>
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <span>Thanh toán khi nhận được hàng</span>
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <rect x="7" y="7" width="3" height="3"/>
                        <rect x="14" y="7" width="3" height="3"/>
                        <rect x="7" y="14" width="3" height="3"/>
                        <path d="M14 14h3v3h-3z"/>
                      </svg>
                    </div>
                    <div>
                      <strong>VietQR</strong>
                      <span>Quét mã QR để thanh toán ngay</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Instructions */}
              {formData.payment_method === 'vietqr' && (
                <div className="payment-instruction vietqr-section">
                  <div className="instruction-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>Quét mã QR để thanh toán</span>
                  </div>
                  
                  {paymentVerified && (
                    <div className="payment-success-banner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <div>
                        <strong>Thanh toán thành công!</strong>
                        <span>Đơn hàng của bạn đang được xử lý</span>
                      </div>
                    </div>
                  )}
                  
                  {!paymentVerified && (
                    <>
                      <div className="vietqr-container">
                        <div className="qr-code-wrapper">
                          <img 
                            src={generateVietQRUrl()} 
                            alt="VietQR Payment Code"
                            className="vietqr-image"
                          />
                        </div>
                        
                        <div className="bank-info">
                          <div className="bank-info-row">
                            <span className="label">Ngân hàng:</span>
                            <span className="value">MB Bank</span>
                          </div>
                          <div className="bank-info-row">
                            <span className="label">Số tài khoản:</span>
                            <span className="value">{BANK_INFO.accountNo}</span>
                          </div>
                          <div className="bank-info-row">
                            <span className="label">Chủ tài khoản:</span>
                            <span className="value">{BANK_INFO.accountName}</span>
                          </div>
                          <div className="bank-info-row">
                            <span className="label">Số tiền:</span>
                            <span className="value amount">{formatPrice(Math.round(total))} VNĐ</span>
                          </div>
                          <div className="bank-info-row">
                            <span className="label">Nội dung CK:</span>
                            <span className="value highlight">{orderNumber}</span>
                          </div>
                        </div>
                        
                        {checkingPayment && (
                          <div className="payment-checking">
                            <div className="checking-spinner"></div>
                            <span>Đang chờ thanh toán...</span>
                          </div>
                        )}
                      </div>
                      
                      <ol>
                        <li>Mở ứng dụng ngân hàng của bạn</li>
                        <li>Quét mã QR hoặc chuyển khoản thủ công</li>
                        <li>Xác nhận thanh toán - Hệ thống sẽ tự động xác nhận</li>
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="note">Ghi chú (Không bắt buộc)</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows="2"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-summary-section">
          <div className="summary-card">
            <h3>Đơn hàng của bạn</h3>
            
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.productId} className="summary-item">
                  <div className="item-image">
                    <img 
                      src={item.product?.image_url || item.product?.image || '/images/placeholder.jpg'} 
                      alt={item.product?.name} 
                    />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-info">
                    <span className="item-name">{item.product?.name}</span>
                    <span className="item-price">
                      {formatPrice((item.product?.discount_price || item.product?.price) * item.quantity)} ₫
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)} ₫</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="free">Miễn phí</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)} ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSection;
