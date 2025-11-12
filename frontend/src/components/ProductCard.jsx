import React from 'react';
import BuyNowButton from './BuyNowButton';
import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = product.image_url || product.image;
  
  return (
    <div className="product-card" onClick={() => onClick && onClick(product)}>
      {/* Featured Badge */}
      {product.featured && (
        <div className="featured-badge">FEATURED</div>
      )}
      
      {/* Favorite Button */}
      <button className="favorite-button" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      
      {/* Product Image Section */}
      <div className="card__image-section">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Product Info Section */}
      <div className="card__info-section">
        <h3 className="product-name">{product.name || 'Unnamed Product'}</h3>
        <p className="product-desc">{product.description || 'No description available'}</p>
        
        <div className="card__category-badge">
          {product.category?.name || 'UNCATEGORIZED'}
        </div>
        
        {product.price && (
          <div className="product-price">
            ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        
        {/* Buy Now Button */}
        <div className="buy-now-wrapper" onClick={(e) => e.stopPropagation()}>
          <BuyNowButton 
            price={product.price} 
            onClick={() => onClick && onClick(product)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
