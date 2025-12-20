import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingCart, X, CreditCard, ArrowLeft } from 'lucide-react';
import useCartStore from '../store/cartStore';
import './CartPage.css';

const CartPageInteractive = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [notification, setNotification] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateQuantity = async (itemId, delta) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      showNotification('❌ Không thể cập nhật số lượng', 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeItem(itemId);
    if (result.success) {
      showNotification('✓ Đã xóa sản phẩm khỏi giỏ hàng', 'success');
    } else {
      showNotification('❌ Không thể xóa sản phẩm', 'error');
    }
  };

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Vui lòng nhập họ tên';
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Vui lòng nhập số điện thoại';
    if (!formData.customer_address.trim()) newErrors.customer_address = 'Vui lòng nhập địa chỉ';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement order API call
      showNotification('✓ Chức năng đặt hàng đang được phát triển!', 'success');
      setTimeout(() => {
        setShowCheckoutForm(false);
      }, 1500);
    } catch (error) {
      showNotification('❌ Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="cart-loading">Đang tải...</div>;
  }

  if (!items.length) {
    return (
      <div className="cart-empty" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingCart size={80} style={{ color: '#ccc', marginBottom: '20px' }} />
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <button onClick={() => navigate('/products')} className="btn-continue" style={{ marginTop: '20px', padding: '12px 30px', background: '#c97a4a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  if (showCheckoutForm) {
    return (
      <div className="cart-page-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {notification && (
          <div className={`notification ${notification.type}`} style={{ position: 'fixed', top: '20px', right: '20px', padding: '15px 20px', borderRadius: '8px', background: notification.type === 'success' ? '#4caf50' : '#f44336', color: 'white', zIndex: 1000 }}>
            {notification.message}
          </div>
        )}
        
        <button onClick={() => setShowCheckoutForm(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#c97a4a', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
          <ArrowLeft size={20} /> Quay lại giỏ hàng
        </button>

        <h2 style={{ marginBottom: '30px' }}>Thông tin đặt hàng</h2>
        
        <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            {errors.customer_name && <span style={{ color: 'red', fontSize: '14px' }}>{errors.customer_name}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại *</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            {errors.customer_phone && <span style={{ color: 'red', fontSize: '14px' }}>{errors.customer_phone}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ *</label>
            <textarea
              name="customer_address"
              value={formData.customer_address}
              onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            {errors.customer_address && <span style={{ color: 'red', fontSize: '14px' }}>{errors.customer_address}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ghi chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>

          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Tổng tiền:</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#c97a4a' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ width: '100%', padding: '15px', background: '#c97a4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{ position: 'fixed', top: '20px', right: '20px', padding: '15px 20px', borderRadius: '8px', background: notification.type === 'success' ? '#4caf50' : '#f44336', color: 'white', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {notification.message}
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#333' }}>Giỏ hàng của bạn</h1>
        <button onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'none', border: '1px solid #c97a4a', color: '#c97a4a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Tiếp tục mua sắm
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                style={{ padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <img 
                  src={item.product.image_url || 'https://via.placeholder.com/80'} 
                  alt={item.product.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', background: '#f5f5f5' }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>{item.product.name}</h3>
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
                        {item.product.category?.name || 'Product'}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999' }}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '8px', padding: '4px' }}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Minus size={16} />
                      </motion.button>
                      <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#c97a4a' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ position: 'sticky', top: '20px', height: 'fit-content', padding: '24px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <ShoppingCart size={20} style={{ color: '#666' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>Cart ({itemCount})</h2>
          </div>

          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>Total</span>
              <motion.span 
                key={total}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                style={{ fontSize: '28px', fontWeight: '700', color: '#c97a4a' }}
              >
                ${total.toFixed(2)}
              </motion.span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              style={{ width: '100%', padding: '16px', background: '#c97a4a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <CreditCard size={20} />
              Checkout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartPageInteractive;
