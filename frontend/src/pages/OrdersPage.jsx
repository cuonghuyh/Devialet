import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI } from '../api/review';
import './OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState([]);

  const fetchOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
        // Update selected order if modal is open
        if (selectedOrder) {
          const updatedOrder = (data.orders || []).find(o => o.id === selectedOrder.id);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [selectedOrder]);

  // Fetch reviewed products
  const fetchReviewedProducts = useCallback(async () => {
    try {
      const data = await reviewAPI.getMyReviewedProducts();
      setReviewedProducts(data.reviewed_product_ids || []);
    } catch (error) {
      console.error('Error fetching reviewed products:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchReviewedProducts();
  }, []);

  // Polling every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(false); // Don't show loading spinner for background updates
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOrders]);

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
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const handleReviewProduct = (productId) => {
    navigate(`/products/${productId}`);
    setShowDetailModal(false);
  };

  const openReviewModal = (product) => {
    setReviewProduct(product);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewProduct) return;
    
    setSubmittingReview(true);
    try {
      await reviewAPI.createReview({
        product_id: reviewProduct.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      
      // Add product to reviewed list
      setReviewedProducts(prev => [...prev, reviewProduct.id]);
      
      alert('Đánh giá thành công!');
      setShowReviewModal(false);
      setReviewProduct(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
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
      unpaid: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      refunded: 'Đã hoàn tiền',
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const texts = {
      cod: 'Tiền mặt',
      bank_transfer: 'Chuyển khoản',
      credit_card: 'Thẻ tín dụng',
      momo: 'MoMo',
      vietqr: 'VietQR',
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
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi và quản lý đơn hàng</p>
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
                    {order.items && order.items.map((item, index) => (
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
                        {order.status === 'delivered' && item.product && (
                          reviewedProducts.includes(item.product.id) ? (
                            <span className="item-reviewed-badge">✓ Đã đánh giá</span>
                          ) : (
                            <button 
                              className="item-review-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReviewModal(item.product);
                              }}
                            >
                              ⭐ Đánh giá
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="order-details-summary">
                    <div className="detail-row">
                      <span>Phương thức thanh toán</span>
                      <span>{getPaymentMethodText(order.payment_method)}</span>
                    </div>
                    <div className="detail-row total">
                      <span>Tổng cộng</span>
                      <span className="total-amount">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(order)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>Chưa có đơn hàng</h3>
            <p>Bạn chưa có đơn hàng nào</p>
            <button className="shop-now-btn" onClick={() => navigate('/products')}>
              Mua sắm ngay
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
              <h2>Chi tiết đơn hàng</h2>
              <p className="order-number-large">#{selectedOrder.order_number}</p>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Trạng thái đơn hàng</h3>
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
                <p className="order-date-full">Đặt hàng lúc {formatDate(selectedOrder.created_at)}</p>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ tên</label>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Điện thoại</label>
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                  <div className="info-item full-width">
                    <label>Địa chỉ</label>
                    <span>{selectedOrder.customer_address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sản phẩm</h3>
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
                        <p className="item-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} x {item.quantity}</p>
                      </div>
                      <div className="item-actions">
                        <div className="item-subtotal">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                        </div>
                        {selectedOrder.status === 'delivered' && item.product && (
                          reviewedProducts.includes(item.product.id) ? (
                            <span className="reviewed-badge">✓ Đã đánh giá</span>
                          ) : (
                            <button 
                              className="review-product-btn"
                              onClick={() => openReviewModal(item.product)}
                            >
                              Đánh giá
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin thanh toán</h3>
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Phương thức thanh toán</span>
                    <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tạm tính</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span className="free">{selectedOrder.shipping_fee > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shipping_fee) : 'Miễn phí'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng cộng</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p className="order-note">{selectedOrder.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewProduct && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReviewModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="review-modal-header">
              <h2>Đánh giá sản phẩm</h2>
              <div className="review-product-info">
                {reviewProduct.image_url && (
                  <img src={reviewProduct.image_url} alt={reviewProduct.name} />
                )}
                <h3>{reviewProduct.name}</h3>
              </div>
            </div>

            <div className="review-modal-body">
              <div className="rating-section">
                <label>Đánh giá của bạn</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviewForm.rating >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="comment-section">
                <label>Nhận xét của bạn</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows={6}
                  required
                />
              </div>

              <div className="review-modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowReviewModal(false)}
                  disabled={submittingReview}
                >
                  Hủy
                </button>
                <button 
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewForm.comment.trim()}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
