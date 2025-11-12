import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AddToCartButton from '../components/AddToCartButton';
import { productsAPI } from '../api/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { itemCount, addToCart } = useCartStore();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) setSelectedCategory(category);
    if (search) setSearchTerm(search);
    
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getProducts({ 
            filter: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: search || undefined
          }),
          productsAPI.getCategories()
        ]);
        
        setProducts(productsData.products || productsData || []);
        setCategories(categoriesData.categories || categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const result = await addToCart(product.id, 1);
    if (result.success) {
      showNotification(`✓ Đã thêm ${product.name} vào giỏ hàng!`, 'success');
    } else {
      showNotification('❌ Không thể thêm sản phẩm vào giỏ hàng', 'error');
    }
  };

  return (
    <div className="products-page-new">
      {/* Parallax Hero with 3D Effect */}
      <section className="hero-parallax">
        <div className="parallax-layer layer-1">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="hero-main">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Premium Audio Experience</span>
          </div>
          
          <h1 className="hero-title-3d">
            <span className="title-line" data-text="Acoustic">Acoustic</span>
            <span className="title-line" data-text="Mastery">Mastery</span>
          </h1>
          
          <p className="hero-desc">
            Where engineering meets art. Discover a world of unparalleled sound.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{products.length}+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Premium</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
          </div>
          <span className="toast-message">{notification.message}</span>
        </div>
      )}

      {/* Category Tabs with Line Indicator */}
      <section className="category-tabs-section">
        <div className="tabs-container">
          <div className="tabs-header">
            <h2 className="section-heading">
              <span className="heading-line"></span>
              Explore Collections
            </h2>
          </div>

          <div className="category-tabs">
            <button
              className={`tab-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              <div className="tab-icon-wrapper">
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div className="tab-content">
                <span className="tab-name">All Products</span>
                <span className="tab-count">{products.length} items</span>
              </div>
              <div className="tab-glow"></div>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={`tab-item ${selectedCategory === category.slug ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.slug)}
              >
                <div className="tab-icon-wrapper">
                  {category.slug === 'speakers' && (
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <circle cx="12" cy="8" r="3"/>
                      <circle cx="12" cy="16" r="4"/>
                    </svg>
                  )}
                  {category.slug === 'headphones' && (
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                    </svg>
                  )}
                  {category.slug === 'amplifiers' && (
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="2" y="7" width="20" height="10" rx="2"/>
                      <circle cx="6" cy="12" r="2"/>
                      <path d="M15 9v6M18 9v6"/>
                    </svg>
                  )}
                  {!['speakers', 'headphones', 'amplifiers'].includes(category.slug) && (
                    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  )}
                </div>
                <div className="tab-content">
                  <span className="tab-name">{category.name}</span>
                  <span className="tab-count">
                    {products.filter(p => p.category_id === category.id).length} items
                  </span>
                </div>
                <div className="tab-glow"></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      {loading ? (
        <section className="loading-showcase">
          <div className="loading-visual">
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <div className="pulse-ring ring-3"></div>
            <div className="loading-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13M9 18l-7 2V7l7-2"/>
              </svg>
            </div>
          </div>
          <h3 className="loading-title">Curating Excellence</h3>
          <p className="loading-text">Preparing your premium audio experience...</p>
        </section>
      ) : (
        <section className="products-showcase">
          <div className="showcase-header">
            <div className="header-left">
              <h2 className="showcase-title">
                {selectedCategory === 'all' 
                  ? 'Featured Collection' 
                  : categories.find(c => c.slug === selectedCategory)?.name || 'Products'}
              </h2>
              <div className="products-meta">
                <span className="meta-count">{products.length}</span>
                <span className="meta-label">{products.length === 1 ? 'masterpiece' : 'masterpieces'}</span>
              </div>
            </div>

            {searchTerm && (
              <div className="search-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <span>"{searchTerm}"</span>
                <button 
                  className="clear-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchParams({});
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {products.length > 0 ? (
            <div className="products-masonry">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="masonry-item"
                  style={{ 
                    animationDelay: `${index * 0.08}s`,
                    '--index': index
                  }}
                >
                  <div className="product-card-new" onClick={() => handleProductClick(product)}>
                    <div className="card-image-wrapper">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="card-image"
                      />
                      <div className="image-overlay">
                        <button 
                          className="quick-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>

                    <div className="card-info">
                      <div className="info-top">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                          <span className="price-currency">$</span>
                          <span className="price-amount">{parseFloat(product.price).toFixed(0)}</span>
                          <span className="price-decimal">.{(parseFloat(product.price) % 1).toFixed(2).substring(2)}</span>
                        </div>
                      </div>

                      <p className="product-desc">{product.description}</p>

                      <div className="card-actions">
                        <button
                          className="add-cart-btn"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                          <span className="btn-text">Add to Cart</span>
                          <div className="btn-shine"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-visual">
                <svg viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.1"/>
                  <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <path d="M100 70 L100 130 M70 100 L130 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="empty-title">No Products Available</h3>
              <p className="empty-text">
                We couldn't find any products matching your criteria.<br/>
                Try exploring a different category or view all products.
              </p>
              <button 
                className="empty-cta"
                onClick={() => handleCategoryChange('all')}
              >
                <span>Browse All Products</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Login Modal with Blur Background */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="modal-icon-wrapper">
              <div className="icon-bg"></div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 className="modal-title">Authentication Required</h2>
            <p className="modal-message">
              Sign in to your account to add items to your cart<br/>
              and unlock exclusive features.
            </p>

            <div className="modal-buttons">
              <button 
                className="modal-btn btn-ghost" 
                onClick={() => setShowLoginModal(false)}
              >
                Maybe Later
              </button>
              <button 
                className="modal-btn btn-gradient" 
                onClick={() => navigate('/login')}
              >
                <span>Sign In</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
