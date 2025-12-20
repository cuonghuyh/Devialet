import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('featured');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
    setShowMobileFilter(false);
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
      showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
    } else {
      showNotification(result.message || 'Không thể thêm sản phẩm', 'error');
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  // Filter by price
  const filteredProducts = sortedProducts.filter(product => {
    const price = parseFloat(product.price);
    if (priceRange.min && price < parseFloat(priceRange.min)) return false;
    if (priceRange.max && price > parseFloat(priceRange.max)) return false;
    return true;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className="shop-page">
      {/* Notification */}
      {notification && (
        <div className={`shop-notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <svg className="notif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg className="notif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )} {notification.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="shop-breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Trang chủ</a>
          <span className="separator">›</span>
          <span className="current">Sản phẩm</span>
          {selectedCategory !== 'all' && (
            <>
              <span className="separator">›</span>
              <span className="current">
                {categories.find(c => c.slug === selectedCategory)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setShowMobileFilter(!showMobileFilter)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
        Bộ lọc
      </button>

      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${showMobileFilter ? 'show' : ''}`}>
          <div className="sidebar-header">
            <h2>Bộ lọc</h2>
            <button className="close-sidebar" onClick={() => setShowMobileFilter(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3 className="filter-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              Danh mục
            </h3>
            <ul className="category-list">
              <li 
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                <span className="category-name">Tất cả sản phẩm</span>
                <span className="category-count">{products.length}</span>
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">
                    {products.filter(p => p.category_id === cat.id).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h3 className="filter-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Khoảng giá
            </h3>
            <div className="price-inputs">
              <div className="price-input-wrapper">
                <span className="currency">$</span>
                <input 
                  type="number" 
                  placeholder="Từ"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                />
              </div>
              <span className="price-separator">—</span>
              <div className="price-input-wrapper">
                <span className="currency">$</span>
                <input 
                  type="number" 
                  placeholder="Đến"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
              </div>
            </div>
            <div className="price-shortcuts">
              <button onClick={() => setPriceRange({ min: '', max: '500' })}>Dưới $500</button>
              <button onClick={() => setPriceRange({ min: '500', max: '1000' })}>$500 - $1K</button>
              <button onClick={() => setPriceRange({ min: '1000', max: '2000' })}>$1K - $2K</button>
              <button onClick={() => setPriceRange({ min: '2000', max: '' })}>Trên $2K</button>
            </div>
            {(priceRange.min || priceRange.max) && (
              <button 
                className="clear-filter-btn"
                onClick={() => setPriceRange({ min: '', max: '' })}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Xóa bộ lọc giá
              </button>
            )}
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h3 className="filter-title">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Đánh giá
            </h3>
            <div className="rating-filters">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="rating-option">
                  <input type="radio" name="rating" />
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <span className="rating-text">trở lên</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showMobileFilter && (
          <div className="sidebar-overlay" onClick={() => setShowMobileFilter(false)}></div>
        )}

        {/* Main Content */}
        <main className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <p className="results-count">
                <strong>{filteredProducts.length}</strong> sản phẩm
                {searchTerm && (
                  <span className="search-term">
                    kết quả cho "{searchTerm}"
                    <button className="clear-search" onClick={() => {
                      setSearchTerm('');
                      setSearchParams({});
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
              </p>
            </div>
            
            <div className="toolbar-right">
              <div className="sort-dropdown">
                <label>Sắp xếp:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Nổi bật</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp → cao</option>
                  <option value="price-high">Giá cao → thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>

              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Lưới"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Danh sách"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="4" rx="1"/>
                    <rect x="3" y="10" width="18" height="4" rx="1"/>
                    <rect x="3" y="16" width="18" height="4" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`products-grid ${viewMode}`}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image">
                    <img src={product.image_url} alt={product.name} loading="lazy" />
                    {product.discount_price && (
                      <span className="discount-badge">
                        -{Math.round((1 - product.discount_price / product.price) * 100)}%
                      </span>
                    )}
                    <button 
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        showNotification('Đã thêm vào yêu thích!');
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="product-info">
                    <span className="product-brand">
                      {categories.find(c => c.id === product.category_id)?.name || 'Devialet'}
                    </span>
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < 4 ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                      <span className="rating-count">(128 đánh giá)</span>
                    </div>

                    {viewMode === 'list' && (
                      <p className="product-desc">{product.description}</p>
                    )}
                    
                    <div className="product-pricing">
                      {product.discount_price ? (
                        <>
                          <span className="current-price">${formatPrice(product.discount_price)}</span>
                          <span className="original-price">${formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span className="current-price">${formatPrice(product.price)}</span>
                      )}
                    </div>

                    <div className="product-badges">
                      <span className="badge shipping">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13"/>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        Freeship
                      </span>
                      <span className="badge return">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1 4 1 10 7 10"/>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        Đổi trả 30 ngày
                      </span>
                    </div>

                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={() => {
                setSelectedCategory('all');
                setPriceRange({ min: '', max: '' });
                setSearchParams({});
              }}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="pagination">
              <button className="page-btn prev" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-dots">...</span>
              <button className="page-btn">10</button>
              <button className="page-btn next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2>Đăng nhập để tiếp tục</h2>
            <p>Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLoginModal(false)}>
                Để sau
              </button>
              <button className="btn-primary" onClick={() => navigate('/auth')}>
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
