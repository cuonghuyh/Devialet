import { useState, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage-schon.css';

// Memoized Product Card for better performance
const ProductCard = memo(({ product, onNavigate }) => (
  <div className="product-card-schon">
    <div className="product-image-container">
      <img 
        src={product.images?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'} 
        alt={product.name}
        loading="lazy"
        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'}
      />
      <div className="product-overlay">
        <button 
          className="btn-quickview"
          onClick={() => onNavigate(`/products/${product.id}`)}
        >
          Quick View
        </button>
      </div>
      {product.sale_price && (
        <span className="product-badge">SALE</span>
      )}
    </div>
    <div className="product-info-schon">
      <h3 className="product-title">{product.name}</h3>
      <div className="product-price">
        {product.sale_price ? (
          <>
            <span className="price-sale">${product.sale_price}</span>
            <span className="price-original">${product.price}</span>
          </>
        ) : (
          <span className="price-current">${product.price}</span>
        )}
      </div>
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="star">★</span>
        ))}
        <span className="rating-count">(12)</span>
      </div>
    </div>
  </div>
));

// Skeleton loader for products
const ProductSkeleton = () => (
  <div className="product-card-schon skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div style={{ padding: '16px' }}>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
    </div>
  </div>
);

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 27, hours: 12, minutes: 14, seconds: 0 });
  const navigate = useNavigate();

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schon-homepage">
      {/* Hero Section */}
      <section className="schon-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h3 className="hero-subtitle">DEVIALET</h3>
            <h1 className="hero-title">PHANTOM REACTOR</h1>
            <p className="hero-description">
              Experience pure sound with our revolutionary wireless speakers engineered in France
            </p>
            <Link to="/products" className="btn-hero">DISCOVER</Link>
            
            {/* Countdown Timer */}
            <div className="countdown-timer">
              <div className="countdown-item">
                <span className="countdown-number">{countdown.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.minutes}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.seconds}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop" 
              alt="Devialet Phantom Reactor"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="categories-banner">
        <div className="container">
          <div className="categories-grid">
            <div className="category-card large">
              <img 
                src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop" 
                alt="Phantom Series"
                loading="lazy"
              />
              <div className="category-overlay">
                <h3>PHANTOM SERIES</h3>
                <Link to="/products?category=phantom" className="category-link">
                  Explore Collection →
                </Link>
              </div>
            </div>
            <div className="category-card">
              <img 
                src="https://images.unsplash.com/photo-1590508794271-0b5e18f3d992?w=400&h=400&fit=crop" 
                alt="Dione"
                loading="lazy"
              />
              <div className="category-overlay">
                <h3>DIONE SOUNDBAR</h3>
                <Link to="/products?category=dione" className="category-link">
                  Explore Collection →
                </Link>
              </div>
            </div>
            <div className="category-card">
              <img 
                src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop" 
                alt="Mania"
                loading="lazy"
              />
              <div className="category-overlay">
                <h3>MANIA WIRELESS</h3>
                <Link to="/products?category=mania" className="category-link">
                  Explore Collection →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>SIGNATURE COLLECTION</h2>
            <p>Experience the pinnacle of acoustic engineering</p>
          </div>

          <div className="products-grid-schon">
            {loading ? (
              // Show skeleton while loading
              [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

          <div className="view-all-section">
            <Link to="/products" className="btn-view-all-schon">
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-content">
            <h2>PHANTOM PREMIER</h2>
            <p className="promo-subtitle">Discover the revolutionary 4500W speaker system</p>
            <Link to="/products" className="btn-promo">EXPLORE NOW</Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>STAY CONNECTED</h2>
            <p>Subscribe for exclusive access to new releases and audio innovations</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
              />
              <button type="submit" className="btn-subscribe">SUBSCRIBE</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
