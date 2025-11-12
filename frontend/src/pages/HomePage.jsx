import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const heroRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        // Sử dụng transform thay vì left/top để mượt mà hơn
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Parallax effect for hero elements
      if (heroRef.current) {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;
        
        const elements = heroRef.current.querySelectorAll('.parallax-item');
        elements.forEach((el, index) => {
          const depth = (index + 1) * 0.5;
          el.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="home-page">
      <div className="custom-cursor" ref={cursorRef}></div>

      {/* Hero Section with Animated Background */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-label parallax-item">
            <span className="label-dot"></span>
            <span>Premium Audio Excellence</span>
          </div>
          
          <h1 className="hero-title parallax-item">
            <span className="title-main">SOUND</span>
            <span className="title-main">PERFECTED</span>
            <span className="title-accent">by Devialet</span>
          </h1>
          
          <p className="hero-description parallax-item">
            Where engineering precision meets acoustic artistry. 
            <br />Experience audio in its purest, most powerful form.
          </p>
          
          <div className="hero-stats parallax-item">
            <div className="stat-item">
              <span className="stat-number">108dB</span>
              <span className="stat-label">Sound Pressure</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">0.001%</span>
              <span className="stat-label">Distortion</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4500W</span>
              <span className="stat-label">Peak Power</span>
            </div>
          </div>
          
          <div className="hero-buttons parallax-item">
            <Link to="/products" className="btn-hero-primary">
              <span>Explore Collection</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/contact" className="btn-hero-secondary">
              <span>Get in Touch</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual parallax-item">
          <div className="visual-ring ring-1"></div>
          <div className="visual-ring ring-2"></div>
          <div className="visual-ring ring-3"></div>
          <div className="visual-center">
            <div className="center-glow"></div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-content">
          <div className="philosophy-text">
            <span className="section-label">Our Philosophy</span>
            <h2 className="section-title">Engineering <br/>Excellence</h2>
            <p className="section-description">
              Every Devialet product is born from an obsession with sonic purity. 
              We challenge conventional thinking, merge cutting-edge technology with 
              timeless design, and craft instruments that reveal every detail of your music.
            </p>
            <div className="philosophy-features">
              <div className="philosophy-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Patented ADH® Technology</span>
              </div>
              <div className="philosophy-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>300+ Patents Worldwide</span>
              </div>
              <div className="philosophy-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <span>Designed in Paris</span>
              </div>
            </div>
          </div>
          <div className="philosophy-image">
            <div className="image-frame">
              <div className="frame-corner tl"></div>
              <div className="frame-corner tr"></div>
              <div className="frame-corner bl"></div>
              <div className="frame-corner br"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="showcase-section">
        <div className="showcase-header">
          <span className="section-label">Collections</span>
          <h2 className="section-title">Signature <br/>Products</h2>
        </div>

        <div className="showcase-grid">
          <div className="showcase-card card-large">
            <div className="card-image">
              <div className="card-overlay"></div>
              <div className="card-badge">Flagship</div>
            </div>
            <div className="card-content">
              <h3 className="card-title">Phantom</h3>
              <p className="card-subtitle">Wireless Speaker</p>
              <p className="card-description">
                The most powerful wireless speaker in existence. 
                108dB of pure acoustic intensity.
              </p>
              <Link to="/products?category=speakers" className="card-link">
                <span>Discover Phantom</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          <div className="showcase-card">
            <div className="card-image">
              <div className="card-overlay"></div>
              <div className="card-badge">Premium</div>
            </div>
            <div className="card-content">
              <h3 className="card-title">Gemini</h3>
              <p className="card-subtitle">Wireless Earphones</p>
              <p className="card-description">
                Exceptional clarity in a compact form.
              </p>
              <Link to="/products?category=headphones" className="card-link">
                <span>View Collection</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          <div className="showcase-card">
            <div className="card-image">
              <div className="card-overlay"></div>
              <div className="card-badge">Professional</div>
            </div>
            <div className="card-content">
              <h3 className="card-title">Expert Pro</h3>
              <p className="card-subtitle">Amplification</p>
              <p className="card-description">
                Studio-grade power and precision.
              </p>
              <Link to="/products?category=amplifiers" className="card-link">
                <span>View Collection</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="technology-content">
          <span className="section-label">Innovation</span>
          <h2 className="section-title">Revolutionary <br/>Technology</h2>
          
          <div className="technology-grid">
            <div className="tech-card">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="tech-title">ADH® Amplification</h3>
              <p className="tech-description">
                Analog Digital Hybrid® combines the best of both worlds: 
                the precision of digital with the warmth of analog, delivering unmatched sonic purity.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h3 className="tech-title">SAM® Processing</h3>
              <p className="tech-description">
                Speaker Active Matching® analyzes and adapts to your speaker's unique 
                characteristics in real-time, optimizing every frequency.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M2 12h20"/>
                  <path d="M6 6l12 12M6 18L18 6"/>
                </svg>
              </div>
              <h3 className="tech-title">Push-Push Architecture</h3>
              <p className="tech-description">
                Dual opposing woofers cancel vibrations while doubling acoustic output, 
                achieving impossible levels of bass precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <span className="section-label">What They Say</span>
        <h2 className="section-title">Acclaimed <br/>Worldwide</h2>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-quote">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </div>
            <p className="testimonial-text">
              "The Phantom is a remarkable achievement. It's not just a speaker; 
              it's a statement about what's possible in audio engineering."
            </p>
            <div className="testimonial-author">
              <div className="author-info">
                <span className="author-name">The Verge</span>
                <span className="author-title">Technology Review</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-quote">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </div>
            <p className="testimonial-text">
              "Devialet has redefined what a wireless speaker can be. 
              The sound quality is simply extraordinary."
            </p>
            <div className="testimonial-author">
              <div className="author-info">
                <span className="author-name">WIRED</span>
                <span className="author-title">Product Review</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-quote">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </div>
            <p className="testimonial-text">
              "A masterpiece of industrial design and acoustic engineering. 
              This is the future of high-fidelity audio."
            </p>
            <div className="testimonial-author">
              <div className="author-info">
                <span className="author-name">Forbes</span>
                <span className="author-title">Design & Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="awards-section">
        <div className="awards-content">
          <span className="section-label">Recognition</span>
          <h2 className="section-title">Award-Winning <br/>Design</h2>
          
          <div className="awards-grid">
            <div className="award-item">
              <div className="award-icon">★</div>
              <h3 className="award-name">Red Dot Design Award</h3>
              <p className="award-year">2023</p>
            </div>
            
            <div className="award-item">
              <div className="award-icon">★</div>
              <h3 className="award-name">CES Innovation Award</h3>
              <p className="award-year">2023</p>
            </div>
            
            <div className="award-item">
              <div className="award-icon">★</div>
              <h3 className="award-name">iF Design Award</h3>
              <p className="award-year">2022</p>
            </div>
            
            <div className="award-item">
              <div className="award-icon">★</div>
              <h3 className="award-name">Good Design Award</h3>
              <p className="award-year">2022</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h2 className="newsletter-title">Stay in the Loop</h2>
            <p className="newsletter-description">
              Be the first to know about new products, exclusive events, 
              and special offers from Devialet.
            </p>
          </div>
          <div className="newsletter-form">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-button">
                  <span>Subscribe</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <p className="newsletter-privacy">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Experience Devialet</h2>
          <p className="cta-description">
            Visit our showrooms or schedule a private demonstration to hear the difference.
          </p>
          <Link to="/contact" className="btn-cta">
            <span>Book a Demo</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="cta-background">
          <div className="cta-glow"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
