import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import SearchBar from './SearchBar';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navLinksRef = useRef(null);

  useEffect(() => {
    const navLinks = navLinksRef.current;
    if (!navLinks) return;

    const handleMouseMove = (e) => {
      const rect = navLinks.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      navLinks.style.setProperty('--mouse-x', `${x}%`);
      navLinks.style.setProperty('--mouse-y', `${y}%`);
    };

    navLinks.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      navLinks.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav>
        <div className="logo">DEVIALET</div>
        
        {/* Search Bar - Center Right */}
        <SearchBar />
        
        {/* Cart Icon - Top Right */}
        {isAuthenticated && (
          <div className="cart-icon-wrapper">
            <button className="cart-icon-btn" onClick={() => navigate('/cart')}>
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
            {itemCount > 0 && <span className="cart-text">Cart</span>}
          </div>
        )}
      </nav>
      
      <ul className="nav-links" ref={navLinksRef}>
        <li>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>HOME</span>
          </Link>
        </li>
        
        <li>
          <Link to="/products" className={isActive('/products') ? 'active' : ''}>
            <svg className="nav-icon" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>PRODUCTS</span>
          </Link>
          <div className="product-dropdown">
            <Link to="/products?category=speakers" className="dropdown-category">
              Speakers
            </Link>
            <Link to="/products?category=headphones" className="dropdown-category">
              Headphones
            </Link>
            <Link to="/products?category=amplifiers" className="dropdown-category">
              Amplifiers
            </Link>
            <Link to="/products" className="dropdown-category">
              View All
            </Link>
          </div>
        </li>
        
        <li>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>CONTACT</span>
          </Link>
        </li>
        
        {isAuthenticated && user?.role === 'admin' && (
          <li>
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span>ADMIN</span>
            </Link>
          </li>
        )}
        
        {isAuthenticated ? (
          <li>
            <Link to="/settings" className={`user-link ${isActive('/settings') ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{user?.first_name || 'USER'}</span>
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/login" className={isActive('/login') ? 'active' : ''}>
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>LOGIN</span>
            </Link>
          </li>
        )}
      </ul>
    </>
  );
};

export default Navigation;
