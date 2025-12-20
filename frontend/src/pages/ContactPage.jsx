import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Vui lòng chọn chủ đề';
    if (!formData.message.trim()) newErrors.message = 'Vui lòng nhập nội dung';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification('Gửi thành công! Chúng tôi sẽ phản hồi trong 24h.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      showNotification('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Notification */}
      {notification && (
        <div className={`contact-notification ${notification.type}`}>
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
      <div className="contact-breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Trang chủ</a>
          <span className="separator">›</span>
          <span className="current">Liên hệ</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="contact-hero">
        <div className="hero-content">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </div>

      <div className="contact-container">
        {/* Contact Info Sidebar */}
        <aside className="contact-sidebar">
          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Địa chỉ</h3>
              <p>123 Đường ABC, Quận 1</p>
              <p>TP. Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Hotline</h3>
              <p className="highlight">1900 1234 56</p>
              <p className="sub-text">Miễn phí cuộc gọi</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Email</h3>
              <p>support@devialet.vn</p>
              <p>sales@devialet.vn</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Giờ làm việc</h3>
              <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
              <p>Thứ 7: 8:00 - 12:00</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="social-section">
            <h3>Kết nối với chúng tôi</h3>
            <div className="social-links">
              <a href="#" className="social-link facebook" title="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="social-link instagram" title="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="18" cy="6" r="1"/>
                </svg>
              </a>
              <a href="#" className="social-link youtube" title="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/>
                </svg>
              </a>
              <a href="#" className="social-link zalo" title="Zalo">
                <span>Zalo</span>
              </a>
            </div>
          </div>

          {/* Map Preview */}
          <div className="map-preview">
            <div className="map-placeholder">
              <div className="map-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  <line x1="8" y1="2" x2="8" y2="18"/>
                  <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
              </div>
              <p>Xem bản đồ</p>
            </div>
          </div>
        </aside>

        {/* Contact Form */}
        <main className="contact-main">
          <div className="form-card">
            <div className="form-header">
              <h2>Gửi tin nhắn cho chúng tôi</h2>
              <p>Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className={`form-group ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="name">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0901 234 567"
                    />
                  </div>
                </div>

                <div className={`form-group ${errors.subject ? 'error' : ''}`}>
                  <label htmlFor="subject">
                    Chủ đề <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      </svg>
                    </span>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn chủ đề --</option>
                      <option value="product">Hỏi về sản phẩm</option>
                      <option value="order">Thông tin đơn hàng</option>
                      <option value="warranty">Bảo hành & Đổi trả</option>
                      <option value="partnership">Hợp tác kinh doanh</option>
                      <option value="feedback">Góp ý & Phản hồi</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>
              </div>

              <div className={`form-group ${errors.message ? 'error' : ''}`}>
                <label htmlFor="message">
                  Nội dung <span className="required">*</span>
                </label>
                <div className="input-wrapper textarea-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </span>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    rows={5}
                  />
                </div>
                {errors.message && <span className="error-message">{errors.message}</span>}
                <span className="char-count">{formData.message.length}/1000</span>
              </div>

              <div className="form-footer">
                <p className="privacy-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Thông tin của bạn được bảo mật theo chính sách của chúng tôi
                </p>
                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Câu hỏi thường gặp</h2>
            <div className="faq-list">
              <details className="faq-item">
                <summary>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  Thời gian giao hàng là bao lâu?
                  <span className="toggle-icon">+</span>
                </summary>
                <div className="faq-answer">
                  <p>Thời gian giao hàng từ 2-5 ngày làm việc tùy khu vực. Nội thành TP.HCM và Hà Nội giao trong 24h.</p>
                </div>
              </details>

              <details className="faq-item">
                <summary>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  Chính sách đổi trả như thế nào?
                  <span className="toggle-icon">+</span>
                </summary>
                <div className="faq-answer">
                  <p>Đổi trả miễn phí trong 30 ngày nếu sản phẩm lỗi do nhà sản xuất. Sản phẩm phải còn nguyên tem, hộp.</p>
                </div>
              </details>

              <details className="faq-item">
                <summary>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  Sản phẩm có bảo hành không?
                  <span className="toggle-icon">+</span>
                </summary>
                <div className="faq-answer">
                  <p>Tất cả sản phẩm Devialet được bảo hành chính hãng 24 tháng. Có thể mở rộng lên 36 tháng.</p>
                </div>
              </details>

              <details className="faq-item">
                <summary>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  Có hỗ trợ trả góp không?
                  <span className="toggle-icon">+</span>
                </summary>
                <div className="faq-answer">
                  <p>Hỗ trợ trả góp 0% lãi suất qua các ngân hàng đối tác và ví điện tử. Duyệt nhanh trong 5 phút.</p>
                </div>
              </details>
            </div>
          </div>
        </main>
      </div>

      {/* Support Channels */}
      <div className="support-channels">
        <div className="channels-container">
          <h2>Các kênh hỗ trợ nhanh</h2>
          <div className="channels-grid">
            <a href="tel:19001234" className="channel-card">
              <div className="channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>Gọi điện</h3>
              <p>1900 1234 56</p>
              <span className="channel-tag">Miễn phí</span>
            </a>

            <a href="#" className="channel-card">
              <div className="channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>Live Chat</h3>
              <p>Chat trực tiếp</p>
              <span className="channel-tag online">Online</span>
            </a>

            <a href="mailto:support@devialet.vn" className="channel-card">
              <div className="channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3>Email</h3>
              <p>support@devialet.vn</p>
              <span className="channel-tag">24h phản hồi</span>
            </a>

            <a href="#" className="channel-card">
              <div className="channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3>Trung tâm trợ giúp</h3>
              <p>Xem hướng dẫn</p>
              <span className="channel-tag">100+ bài viết</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
