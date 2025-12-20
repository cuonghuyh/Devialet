import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
} from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            Về trang chủ
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/products"
            className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <Package size={20} />
            <span>Sản phẩm</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            <ShoppingCart size={20} />
            <span>Đơn hàng</span>
          </Link>

          <Link
            to="/admin/users"
            className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Người dùng</span>
          </Link>
        </nav>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
