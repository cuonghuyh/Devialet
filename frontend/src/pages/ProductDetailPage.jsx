import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsAPI.getProduct(id);
        setProduct(data.product || data);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const result = await addToCart(product.id, quantity);
    if (result.success) {
      alert('Added to cart!');
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">
      
      <div className="product-detail-container">
        <button className="back-button" onClick={() => navigate('/products')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Products
        </button>

        <div className="product-detail-content">
          <div className="product-image-section">
            <img
              src={product.image_url || product.image || '/images/placeholder.jpg'}
              alt={product.name}
              className="product-detail-image"
            />
          </div>

          <div className="product-info-section">
            <div className="product-category">{product.category?.name}</div>
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
            
            <p className="product-description">{product.description}</p>
            
            {product.details && (
              <div className="product-details">
                <h3>Product Details</h3>
                <p>{product.details}</p>
              </div>
            )}

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <span className="qty-icon">−</span>
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                    <span className="qty-icon">+</span>
                  </button>
                </div>

                <button 
                  className="add-to-cart-button" 
                  data-tooltip={`$${product.price}`}
                  onClick={handleAddToCart}
                >
                  <div className="button-wrapper">
                    <div className="text">Buy Now</div>
                    <span className="icon">
                      <svg viewBox="0 0 16 16" className="bi bi-cart2" fill="currentColor" height={24} width={24}>
                        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                      </svg>
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                <path d="M8 11V7a4 4 0 118 0v4"/>
              </svg>
            </div>
            <h2>Login Required</h2>
            <p>Please login to add items to your cart</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
