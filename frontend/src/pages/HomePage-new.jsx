import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage-new.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, brands: 0, origin: '' });
  const [filters, setFilters] = useState({
    location: 'Vietnam',
    category: 'All',
    year: 'Any',
    type: 'All'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products.slice(0, 4));
        setStats({
          total: data.total || data.products.length,
          brands: new Set(data.products.map(p => p.category?.name)).size,
          origin: 'Global'
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const featuredProduct = products[0];

  return (
    <div className="homepage-new">
      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-content-wrapper">
          {/* Left Content */}
          <div className="hero-left">
            <h1 className="hero-title-new">
              World's Biggest<br />
              <span className="text-primary-new">Speaker Collection</span>
            </h1>
            <p className="hero-description-new">
              From ultra-premium to affordable. Discover our extensive collection 
              of speakers from the world's leading audio brands. Experience sound 
              like never before.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-discover-new"
                onClick={() => navigate('/products')}
              >
                Discover Now
              </button>
              <button className="btn-video-new">
                <span className="play-icon">▶</span>
                Watch Video
              </button>
            </div>
          </div>

          {/* Center Image */}
          <div className="hero-center">
            {featuredProduct && (
              <div className="featured-product-image">
                <div className="accent-brush"></div>
                <img 
                  src={featuredProduct.images?.[0] || 'https://via.placeholder.com/400x500?text=Speaker'} 
                  alt={featuredProduct.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x500?text=Speaker'}
                />
              </div>
            )}
          </div>

          {/* Right Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF6536" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#FF6536" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#FF6536" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#FF6536" strokeWidth="2"/>
                  <path d="M3 9H21" stroke="#FF6536" strokeWidth="2"/>
                  <path d="M9 21V9" stroke="#FF6536" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.brands}</h3>
                <p>Brands</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#FF6536" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="#FF6536" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.origin}</h3>
                <p>Origin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section-new">
          <div className="filter-group-new">
            <div className="filter-item-new">
              <label>Location</label>
              <select 
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option>Vietnam</option>
                <option>USA</option>
                <option>Europe</option>
                <option>Asia</option>
              </select>
            </div>

            <div className="filter-item-new">
              <label>Category</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option>All</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item-new">
              <label>Year</label>
              <select 
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
              >
                <option>Any</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>

            <div className="filter-item-new">
              <label>Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option>All</option>
                <option>Wireless</option>
                <option>Wired</option>
                <option>Portable</option>
              </select>
            </div>

            <button className="btn-search-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="recently-added-new">
        <div className="section-header-new">
          <div>
            <h2>Recently Added</h2>
            <p>Discover our latest premium speakers from world-class brands</p>
          </div>
          <div className="navigation-arrows">
            <button className="arrow-btn">←</button>
            <button className="arrow-btn active">→</button>
          </div>
        </div>

        <div className="products-grid-new">
          {products.map((product) => (
            <div key={product.id} className="product-card-new-home">
              <div className="product-image-wrapper">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/300x300?text=Speaker'} 
                  alt={product.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x300?text=Speaker'}
                />
              </div>
              <div className="product-info-new">
                <h3>{product.name}</h3>
                <p className="product-meta">
                  <span className="year">Year {new Date().getFullYear()}</span>
                  <span className="category">{product.category?.name || 'Speakers'}</span>
                </p>
                <div className="product-footer-new">
                  <div className="price-new">
                    ${product.sale_price || product.price}
                  </div>
                  <button 
                    className="btn-view-details"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    View Details
                  </button>
                </div>
                <p className="bids-info">{product.stock} bids to be</p>
                <p className="highest-bid">Highest Bid: ${(product.price * 1.1).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-section">
          <Link to="/products" className="btn-view-all-new">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
