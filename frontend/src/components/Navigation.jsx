import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import SearchBar from './SearchBar';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const itemCount = useCartStore((state) => state.itemCount);
  const navLinksRef = useRef(null);
  const navRef = useRef(null);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Hide navigation on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Detect scroll to hide logo
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      
      if (navRef.current) {
        if (scrollPosition > 50) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Detect background color behind navbar - DISABLED to prevent infinite loops
  useEffect(() => {
    // Background detection completely disabled
    return () => {};
    
    const checkBackgroundColor = () => {
      return;
      
      const navElements = [
        { element: navRef.current, name: 'nav' },
        { element: navLinksRef.current, name: 'navLinks' }
      ].filter(item => item.element);
      
      navElements.forEach(({ element, name }) => {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        
        // Sample multiple points across the navbar for better detection
        const samplePoints = [
          { x: rect.left + rect.width * 0.25, y: rect.top + rect.height / 2 },
          { x: rect.left + rect.width * 0.5, y: rect.top + rect.height / 2 },
          { x: rect.left + rect.width * 0.75, y: rect.top + rect.height / 2 },
        ];
        
        const brightnessValues = [];
        
        // Hide navbar temporarily to get elements behind it
        element.style.pointerEvents = 'none';
        
        samplePoints.forEach(point => {
          const elementBehind = document.elementFromPoint(point.x, point.y);
          
          if (elementBehind) {
            // Get the actual computed background color (including inherited)
            let currentElement = elementBehind;
            let bgColor = 'rgba(0, 0, 0, 0)';
            let attempts = 0;
            
            // Traverse up to find non-transparent background
            while (currentElement && attempts < 10) {
              const style = window.getComputedStyle(currentElement);
              const bg = style.backgroundColor;
              
              if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                bgColor = bg;
                break;
              }
              
              currentElement = currentElement.parentElement;
              attempts++;
            }
            
            // Parse RGB values
            const rgb = bgColor.match(/\d+/g);
            
            if (rgb && rgb.length >= 3) {
              // Calculate perceived brightness using luminance formula
              const r = parseInt(rgb[0]);
              const g = parseInt(rgb[1]);
              const b = parseInt(rgb[2]);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              brightnessValues.push(brightness);
            }
          }
        });
        
        element.style.pointerEvents = '';
        
        // Calculate average brightness
        if (brightnessValues.length > 0) {
          const avgBrightness = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
          
          // Debug: Log brightness values (DISABLED)
          // console.log(`${name} brightness:`, avgBrightness.toFixed(2), 'values:', brightnessValues.map(v => v.toFixed(0)));
          
          // More aggressive threshold - if average brightness is below 200, consider it dark
          // Scale: 0-200 = dark (text white), 200-255 = light (text black)
          const isDark = avgBrightness < 200;
          
          if (isDark) {
            element.classList.add('dark-bg');
            element.classList.remove('light-bg');
            if (name === 'nav') setIsDarkBackground(true);
          } else {
            element.classList.add('light-bg');
            element.classList.remove('dark-bg');
            if (name === 'nav') setIsDarkBackground(false);
          }
        }
      });
    };
    
    // All background detection disabled
  }, []);

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
    navigate('/auth');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav ref={navRef}>
        <div className="logo">DEVIALET</div>
        
        {/* Cart Icon - Top Right */}
        <Link to="/cart" className={`top-cart-btn ${isActive('/cart') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {itemCount > 0 && (
            <span className="top-cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>
          )}
        </Link>
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
        
        {isAuthenticated ? (
          <>
            {/* Admin Dashboard Link - only show for admin users */}
            {(user?.role === 'admin' || user?.is_admin) && (
              <li>
                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                  <svg className="nav-icon" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <span>ADMIN</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/settings" className={`user-link ${isActive('/settings') ? 'active' : ''}`}>
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{user?.first_name || 'USER'}</span>
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/auth" className={isActive('/auth') ? 'active' : ''}>
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
