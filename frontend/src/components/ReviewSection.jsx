import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../api/review';
import useAuthStore from '../store/authStore';
import './ReviewSection.css';

const ReviewSection = ({ productId, initialData }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState(initialData?.reviews || []);
  const [averageRating, setAverageRating] = useState(initialData?.average_rating || 0);
  const [totalReviews, setTotalReviews] = useState(initialData?.total_reviews || 0);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(!initialData);

  useEffect(() => {
    // If we have initialData, only check user review status (much faster!)
    const loadData = async () => {
      if (!initialData) {
        setReviewsLoading(true);
      }
      
      try {
        const promises = [];
        
        // Only fetch reviews if no initialData
        if (!initialData) {
          promises.push(reviewAPI.getProductReviews(productId));
        }
        
        // Always check user review status if authenticated
        if (isAuthenticated) {
          promises.push(reviewAPI.checkUserReview(productId));
        }
        
        if (promises.length === 0) {
          setReviewsLoading(false);
          return;
        }
        
        const results = await Promise.all(promises);
        
        let resultIndex = 0;
        
        // Set reviews data only if fetched
        if (!initialData) {
          const reviewsData = results[resultIndex++];
          setReviews(reviewsData.reviews || []);
          setAverageRating(reviewsData.average_rating || 0);
          setTotalReviews(reviewsData.total_reviews || 0);
        }
        
        // Set user review data if authenticated
        if (isAuthenticated && results[resultIndex]) {
          const userReviewData = results[resultIndex];
          setCanReview(userReviewData.can_review);
          if (userReviewData.has_reviewed) {
            setUserReview(userReviewData.review);
            setRating(userReviewData.review.rating);
            setComment(userReviewData.review.comment || '');
          }
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    loadData();
  }, [productId, isAuthenticated, initialData]);

  const loadReviews = async () => {
    try {
      const data = await reviewAPI.getProductReviews(productId);
      setReviews(data.reviews || []);
      setAverageRating(data.average_rating || 0);
      setTotalReviews(data.total_reviews || 0);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const checkUserReview = async () => {
    try {
      const data = await reviewAPI.checkUserReview(productId);
      setCanReview(data.can_review);
      if (data.has_reviewed) {
        setUserReview(data.review);
        setRating(data.review.rating);
        setComment(data.review.comment || '');
      }
    } catch (err) {
      console.error('Error checking user review:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userReview) {
        // Update existing review
        await reviewAPI.updateReview(userReview.id, { rating, comment });
      } else {
        // Create new review
        await reviewAPI.createReview({
          product_id: productId,
          rating,
          comment,
        });
      }
      
      setShowReviewForm(false);
      // Reload reviews immediately to show new review
      await loadReviews();
      await checkUserReview();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewAPI.deleteReview(userReview.id);
      setUserReview(null);
      setRating(5);
      setComment('');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
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

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Đánh giá sản phẩm</h2>
        <div className="rating-summary">
          {renderStars(averageRating)}
          <span className="average-rating">{averageRating || 0}/5</span>
          <span className="total-reviews">({totalReviews} đánh giá)</span>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="user-review-section">
          {!canReview ? (
            <div className="cannot-review-notice">
              <p>ℹ️ Bạn cần mua và nhận hàng thành công để có thể đánh giá sản phẩm này</p>
            </div>
          ) : userReview ? (
            <div className="user-has-reviewed">
              <p>✓ Bạn đã đánh giá sản phẩm này</p>
              <button onClick={() => setShowReviewForm(true)} className="btn-edit">
                Chỉnh sửa đánh giá
              </button>
              <button onClick={handleDelete} className="btn-delete">
                Xóa đánh giá
              </button>
            </div>
          ) : (
            <button onClick={() => setShowReviewForm(true)} className="btn-review">
              ✍️ Viết đánh giá
            </button>
          )}

          {showReviewForm && (
            <div className="review-form-overlay" onClick={() => setShowReviewForm(false)}>
              <div className="review-form-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{userReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}</h3>
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
                    <button type="submit" disabled={loading} className="btn-submit">
                      {loading ? 'Đang gửi...' : userReview ? 'Cập nhật' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="login-prompt">
          <p>Vui lòng <a href="/auth">đăng nhập</a> để viết đánh giá</p>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <img 
                    src={review.user.avatar || 'https://via.placeholder.com/40'} 
                    alt={review.user.name}
                    className="reviewer-avatar"
                  />
                  <div>
                    <div className="reviewer-name">{review.user.name}</div>
                    <div className="review-date">{review.created_at}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
