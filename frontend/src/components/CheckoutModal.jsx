import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import './CheckoutModal.css';

// VietQR bank codes - common banks
const BANK_INFO = {
  bankId: 'MB', // MB Bank - you can change to your bank
  accountNo: '0385883358', // Your account number
  accountName: 'DEVIALET STORE', // Account holder name
  template: 'compact1', // QR template style
};

// Backend proxy API for payment check (avoids CORS issues)
const PAYMENT_CHECK_API = 'http://localhost:8000/api/payment/check';

const CheckoutModal = ({ isOpen, onClose, cartItems, total, onCheckoutSuccess }) => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const paymentCheckInterval = useRef(null);

  // Generate random order number for transfer description
  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(`DV${randomNum}`);
      setPaymentVerified(false);
    }
  }, [isOpen]);

  // Auto-check payment when VietQR is selected
  useEffect(() => {
    if (formData.payment_method === 'vietqr' && isOpen && !paymentVerified) {
      startPaymentCheck();
    } else {
      stopPaymentCheck();
    }

    return () => stopPaymentCheck();
  }, [formData.payment_method, isOpen, orderNumber]);

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
    const amount = Math.round(total); // Use total directly from cart
    const description = `Thanh toan don hang ${orderNumber}`;
    
    // VietQR API URL format
    // https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}
    const url = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
    
    return url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Full name is required';
    }
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Invalid phone number';
    }
    if (!formData.customer_address.trim()) {
      newErrors.customer_address = 'Address is required';
    }
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Invalid email address';
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
      
      // Prepare cart items for API
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
        // Clear cart after successful order
        clearCart();
        onCheckoutSuccess(data.order);
        onClose();
        // Redirect to products page after successful order
        setTimeout(() => {
          navigate('/products');
        }, 500);
      } else {
        setErrors({ submit: data.error || 'Failed to create order' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
            <p className="success-amount">{new Intl.NumberFormat('vi-VN').format(Math.round(total))} VNĐ</p>
            <button 
              className="success-popup-btn"
              onClick={async () => {
                // Create order after successful payment
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
                    onClose();
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
      
      <div className="checkout-modal-overlay" onClick={onClose}>
        <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="checkout-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="checkout-modal-header">
            <h2>Checkout</h2>
            <p>Please fill in your delivery information</p>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Customer Information</h3>
              
              <div className="form-group">
                <label htmlFor="customer_name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                className={errors.customer_name ? 'error' : ''}
              />
              {errors.customer_name && <span className="error-message">{errors.customer_name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customer_phone">
                  Phone Number <span className="required">*</span>
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
                <label htmlFor="customer_email">Email (Optional)</label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={errors.customer_email ? 'error' : ''}
                />
                {errors.customer_email && <span className="error-message">{errors.customer_email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customer_address">
                Delivery Address <span className="required">*</span>
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                placeholder="Enter your full address"
                rows="3"
                className={errors.customer_address ? 'error' : ''}
              />
              {errors.customer_address && <span className="error-message">{errors.customer_address}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            
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
                    <strong>Cash on Delivery</strong>
                    <span>Pay when you receive</span>
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
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <text x="12" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="white">M</text>
                    </svg>
                  </div>
                  <div>
                    <strong>MoMo</strong>
                    <span>Pay via MoMo e-wallet</span>
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
                    <span>Scan QR to pay instantly</span>
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
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <div>
                    <strong>Bank Transfer</strong>
                    <span>Transfer to our account</span>
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
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <div>
                    <strong>Credit Card</strong>
                    <span>Visa, Mastercard, etc.</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Instructions */}
            {formData.payment_method === 'momo' && (
              <div className="payment-instruction">
                <div className="instruction-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>How to pay with MoMo</span>
                </div>
                <ol>
                  <li>After placing order, you'll receive a MoMo payment link</li>
                  <li>Open MoMo app and complete the payment</li>
                  <li>Your order will be confirmed automatically</li>
                </ol>
              </div>
            )}

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
                
                {/* Payment Verified Success */}
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
                          <span className="value amount">{new Intl.NumberFormat('vi-VN').format(Math.round(total))} VNĐ</span>
                        </div>
                        <div className="bank-info-row">
                          <span className="label">Nội dung CK:</span>
                          <span className="value highlight">{orderNumber}</span>
                        </div>
                      </div>
                      
                      {/* Payment checking status */}
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
              <label htmlFor="note">Note (Optional)</label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Any special instructions?"
                rows="2"
              />
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <span>{item.product?.name} × {item.quantity}</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)} ₫</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('vi-VN').format(total)} ₫</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{new Intl.NumberFormat('vi-VN').format(total)} ₫</span>
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
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CheckoutModal;
