import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../api/review';
import { useNavigate } from 'react-router-dom';
import './MyReviewsPage.css';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await reviewAPI.getReviewableProducts();
      setProducts(data.products);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (product) => {
    setSelectedProduct(product);
    setRating(5);
    setComment('');
    setError('');
    setShowReviewForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await reviewAPI.createReview({
        product_id: selectedProduct.id,
        rating,
        comment,
      });
      
      setShowReviewForm(false);
      loadProducts(); // Reload to update has_reviewed status
      alert('✓ Đánh giá thành công!');
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onHover = null, onClick = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onClick={() => interactive && onClick && onClick(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="my-reviews-page">
      <div className="page-header">
        <h1>Đánh giá sản phẩm đã mua</h1>
        <p>Chia sẻ trải nghiệm của bạn về các sản phẩm đã mua</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có sản phẩm nào đã giao để đánh giá</p>
          <button onClick={() => navigate('/products')} className="btn-shop">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="category">{product.category}</span>
                {product.has_reviewed ? (
                  <div className="reviewed-badge">
                    <span>✓ Đã đánh giá</span>
                    <button onClick={() => navigate(`/products/${product.id}`)} className="btn-view">
                      Xem đánh giá
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleReviewClick(product)} className="btn-review">
                    Viết đánh giá
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showReviewForm && selectedProduct && (
        <div className="review-modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowReviewForm(false)}>×</button>
            
            <div className="modal-header">
              <img src={selectedProduct.image_url || 'https://via.placeholder.com/80'} alt={selectedProduct.name} />
              <div>
                <h3>{selectedProduct.name}</h3>
                <span className="category">{selectedProduct.category}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Đánh giá của bạn:</label>
                {renderStars(rating, true, setRating, setRating)}
              </div>

              <div className="form-group">
                <label>Nhận xét:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={5}
                  maxLength={1000}
                />
                <small>{comment.length}/1000 ký tự</small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="btn-submit">
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
