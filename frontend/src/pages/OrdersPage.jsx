import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#f44336',
    };
    return colors[status] || '#999';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: '#f44336',
      paid: '#4CAF50',
      refunded: '#FF9800',
    };
    return colors[status] || '#999';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      unpaid: 'Unpaid',
      paid: 'Paid',
      refunded: 'Refunded',
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const texts = {
      cod: 'Cash on Delivery',
      bank_transfer: 'Bank Transfer',
      credit_card: 'Credit Card',
    };
    return texts[method] || method;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="orders-page loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3 className="order-number">#{order.order_number}</h3>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-status-badges">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span 
                      className="payment-badge" 
                      style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}
                    >
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.items && order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item-preview">
                        <div className="item-preview-image">
                          {item.product?.image_url ? (
                            <img src={item.product.image_url} alt={item.product_name} />
                          ) : (
                            <div className="placeholder">📦</div>
                          )}
                        </div>
                        <div className="item-preview-info">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="more-items">+{order.items.length - 3} more</div>
                    )}
                  </div>

                  <div className="order-details-summary">
                    <div className="detail-row">
                      <span>Payment Method</span>
                      <span>{getPaymentMethodText(order.payment_method)}</span>
                    </div>
                    <div className="detail-row total">
                      <span>Total</span>
                      <span className="total-amount">${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet</p>
            <button className="shop-now-btn" onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="modal-header">
              <h2>Order Details</h2>
              <p className="order-number-large">#{selectedOrder.order_number}</p>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Order Status</h3>
                <div className="status-info">
                  <span 
                    className="status-badge large" 
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                  <span 
                    className="payment-badge large" 
                    style={{ backgroundColor: getPaymentStatusColor(selectedOrder.payment_status) }}
                  >
                    {getPaymentStatusText(selectedOrder.payment_status)}
                  </span>
                </div>
                <p className="order-date-full">Ordered on {formatDate(selectedOrder.created_at)}</p>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div className="info-item full-width">
                    <label>Address</label>
                    <span>{selectedOrder.customer_address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item-detail">
                      <div className="item-image">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt={item.product_name} />
                        ) : (
                          <div className="placeholder">📦</div>
                        )}
                      </div>
                      <div className="item-info">
                        <h4>{item.product_name}</h4>
                        <p className="item-price">${parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="item-subtotal">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Payment Method</span>
                    <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping Fee</span>
                    <span className="free">{selectedOrder.shipping_fee > 0 ? `$${parseFloat(selectedOrder.shipping_fee).toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="detail-section">
                  <h3>Note</h3>
                  <p className="order-note">{selectedOrder.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
