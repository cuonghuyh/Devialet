import { Link } from 'react-router';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-logo">DEVIALET</h3>
          <p className="footer-tagline">Acoustic Excellence</p>
          <p className="footer-description">
            Experience sound like never before. Pushing the boundaries of acoustic engineering with groundbreaking technology.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Products</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=speakers">Speakers</Link></li>
            <li><Link to="/products?category=headphones">Headphones</Link></li>
            <li><Link to="/products?category=amplifiers">Amplifiers</Link></li>
            <li><Link to="/products?category=accessories">Accessories</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Company</h4>
          <ul className="footer-links">
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Press</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Support</h4>
          <ul className="footer-links">
            <li><Link to="/">Help Center</Link></li>
            <li><Link to="/">Warranty</Link></li>
            <li><Link to="/">Shipping Info</Link></li>
            <li><Link to="/">Returns</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Follow Us</h4>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg className="social-icon" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg className="social-icon" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Devialet. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/">Privacy Policy</Link>
          <span className="separator">|</span>
          <Link to="/">Terms of Service</Link>
          <span className="separator">|</span>
          <Link to="/">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
