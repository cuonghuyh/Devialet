import React, { useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems, total, onCheckoutSuccess }) => {
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
        onCheckoutSuccess(data.order);
        onClose();
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
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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
  );
};

export default CheckoutModal;
