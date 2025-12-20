import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const user = useAuthStore.getState().user;
        
        // Kiểm tra role admin
        if (user && user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError('Bạn không có quyền truy cập trang quản trị');
          await useAuthStore.getState().logout();
          // Không reload - chỉ hiển thị lỗi
        }
      } else {
        setError(result.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-shield">
            <Shield size={48} />
          </div>
          <h1>Admin Login</h1>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>
              <Mail size={20} />
              Email Admin
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@devialet.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={20} />
              Mật khẩu
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">Đang đăng nhập...</span>
            ) : (
              <>
                <Shield size={20} />
                Đăng nhập Admin
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Chỉ dành cho quản trị viên</p>
          <button onClick={() => navigate('/')} className="back-home">← Về trang chủ</button>
        </div>
      </div>

      <div className="admin-login-bg">
        <div className="bg-gradient"></div>
      </div>
    </div>
  );
}
