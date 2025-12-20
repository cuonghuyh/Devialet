import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Save,
  X,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  Star,
  MessageSquare
} from 'lucide-react';
import { adminAPI } from '../api/admin';
import { categoryAPI } from '../api/category';
import useAuthStore from '../store/authStore';
import './StandaloneDashboard.css';

function StandaloneDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      // Backend might return response.data.data or response.data
      const data = response.data?.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      console.log('Categories API response:', response);
      // Handle different response structures
      const data = response.data?.data || response.data?.categories || response.data || [];
      console.log('Categories data:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders();
      const data = response.data?.data || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      const data = response.data?.data || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReviews();
      const data = response.data?.data || response.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await adminAPI.deleteReview(reviewId);
        setReviews(reviews.filter(r => r.id !== reviewId));
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Không thể xóa đánh giá');
      }
    }
  };

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    sku: '',
    stock: '',
    category_id: '',
    image: null
  });
  const [formLoading, setFormLoading] = useState(false);

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      sku: '',
      stock: '',
      category_id: '',
      image: null
    });
    setEditingProduct(null);
    setImagePreview('');
  };

  const handleOpenAddModal = () => {
    resetProductForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      sku: product.sku || '',
      stock: product.stock || '',
      category_id: product.category_id || '',
      image: null
    });
    setImagePreview(product.image || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetProductForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductForm({ ...productForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', productForm.price);
      if (productForm.discount_price) formData.append('discount_price', productForm.discount_price);
      formData.append('sku', productForm.sku || '');
      formData.append('stock', productForm.stock || 0);
      formData.append('category_id', productForm.category_id);
      if (productForm.image) formData.append('image', productForm.image);

      if (editingProduct) {
        formData.append('_method', 'PUT');
        await adminAPI.updateProduct(editingProduct.id, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await adminAPI.createProduct(formData);
        alert('Thêm sản phẩm thành công!');
      }

      handleCloseModal();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      const errorMsg = error.response?.data?.message || 
                       (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Không thể lưu sản phẩm');
      alert('Có lỗi xảy ra: ' + errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await adminAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        alert('Xóa sản phẩm thành công!');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Không thể xóa sản phẩm');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(orderSearchTerm) || 
                          order.user?.name?.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(review =>
    review.product?.name?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
    review.user?.name?.toLowerCase().includes(reviewSearchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav>
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <div className="logo-box">D</div>
              <span className="logo-name">Devialet</span>
            </div>

            <div className="sidebar-menu">
              <button
                className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>

              <button
                className={`menu-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package size={20} />
                <span>Sản phẩm</span>
              </button>

              <button
                className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart size={20} />
                <span>Đơn hàng</span>
              </button>

              <button
                className={`menu-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={20} />
                <span>Người dùng</span>
              </button>

              <button
                className={`menu-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={20} />
                <span>Đánh giá</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="top-header">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <LayoutDashboard size={24} />
          </button>

          <div className="header-search">
            <Search size={20} />
            <input type="text" placeholder="Tìm kiếm..." />
          </div>

          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            <button className="header-icon-btn">
              <Settings size={20} />
            </button>

            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="profile-details">
                  <span className="profile-name">{user?.name || 'Admin'}</span>
                  <span className="profile-role">Administrator</span>
                </div>
                <ChevronDown size={16} />
              </button>

              {showProfileMenu && (
                <div className="dropdown-menu">
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'dashboard' && (
            <>
              <div className="page-title">
                <h1>Dashboard</h1>
                <p>Tổng quan về cửa hàng của bạn</p>
              </div>

              <div className="stats-container">
                <div className="stat-box">
                  <div className="stat-icon blue">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Doanh thu</div>
                    <div className="stat-value">$45,231</div>
                    <div className="stat-trend up">
                      <TrendingUp size={14} />
                      <span>+12.5%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon green">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Đơn hàng</div>
                    <div className="stat-value">1,234</div>
                    <div className="stat-trend up">
                      <TrendingUp size={14} />
                      <span>+8.2%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon orange">
                    <Package size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Sản phẩm</div>
                    <div className="stat-value">{products.length}</div>
                    <div className="stat-trend up">
                      <TrendingUp size={14} />
                      <span>+5.1%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon purple">
                    <UserCheck size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Khách hàng</div>
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-trend up">
                      <TrendingUp size={14} />
                      <span>+3.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="admin-products">
              <div className="products-header">
                <h1><Package size={32} /> Quản lý sản phẩm</h1>
                <button className="btn-add" onClick={handleOpenAddModal}>
                  <Plus size={20} /> Thêm sản phẩm
                </button>
              </div>

              <div className="products-filters">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>SKU</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Danh mục</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id}>
                          <td>
                            <img src={product.image} alt={product.name} className="product-thumb" />
                          </td>
                          <td>
                            <div className="product-name">{product.name}</div>
                          </td>
                          <td>{product.sku}</td>
                          <td>
                            <div className="price-cell">
                              <span className="current-price">${product.price}</span>
                              {product.discount_price && (
                                <span className="discount-price">${product.discount_price}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`stock-badge ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td>{product.category?.name}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-edit" onClick={() => handleOpenEditModal(product)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-orders">
              <div className="orders-header">
                <h1><ShoppingCart size={32} /> Quản lý đơn hàng</h1>
              </div>

              <div className="orders-filters">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Tìm đơn hàng..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đã gửi</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                        <div className="order-info">
                          <h3>#{order.id}</h3>
                          <p className="customer-name">{order.user?.name}</p>
                          <p className="order-date">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="order-summary">
                          <span className="order-total">${order.total_amount}</span>
                          <span className={`status-badge ${order.status}`}>{order.status}</span>
                          <ChevronDown className={`expand-icon ${expandedOrderId === order.id ? 'expanded' : ''}`} />
                        </div>
                      </div>

                      {expandedOrderId === order.id && (
                        <div className="order-details">
                          <div className="details-grid">
                            <div className="detail-section">
                              <h4>Thông tin khách hàng</h4>
                              <p><strong>Tên:</strong> {order.user?.name}</p>
                              <p><strong>Email:</strong> {order.user?.email}</p>
                              <p><strong>Điện thoại:</strong> {order.phone}</p>
                            </div>
                            <div className="detail-section">
                              <h4>Địa chỉ giao hàng</h4>
                              <p>{order.shipping_address}</p>
                            </div>
                          </div>

                          <div className="order-items">
                            <h4>Sản phẩm</h4>
                            <table>
                              <thead>
                                <tr>
                                  <th>Hình</th>
                                  <th>Sản phẩm</th>
                                  <th>Số lượng</th>
                                  <th>Giá</th>
                                  <th>Tổng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map(item => (
                                  <tr key={item.id}>
                                    <td><img src={item.product?.image} className="item-thumb" /></td>
                                    <td>{item.product?.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price}</td>
                                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="order-totals">
                            <div className="total-row">
                              <span>Tạm tính:</span>
                              <span>${order.subtotal}</span>
                            </div>
                            <div className="total-row">
                              <span>Phí vận chuyển:</span>
                              <span>${order.shipping_fee || 0}</span>
                            </div>
                            <div className="total-row grand-total">
                              <span>Tổng cộng:</span>
                              <span>${order.total_amount}</span>
                            </div>
                          </div>

                          <div className="order-actions">
                            <label>Trạng thái:</label>
                            <select value={order.status}>
                              <option value="pending">Chờ xử lý</option>
                              <option value="processing">Đang xử lý</option>
                              <option value="shipped">Đã gửi</option>
                              <option value="delivered">Đã giao</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-users">
              <div className="users-header">
                <h1><Users size={32} /> Quản lý người dùng</h1>
              </div>

              <div className="users-filters">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Tìm người dùng..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <div className="users-grid">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="user-card">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <div className="user-detail">
                          <Mail size={16} />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="user-detail">
                            <Phone size={16} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="user-detail">
                          <Calendar size={16} />
                          <span>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="user-role">
                          <span className={`role-badge ${user.role || 'user'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="admin-reviews">
              <div className="reviews-header">
                <h1><Star size={32} /> Quản lý đánh giá</h1>
              </div>

              <div className="reviews-filters">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Tìm đánh giá..."
                    value={reviewSearchTerm}
                    onChange={(e) => setReviewSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : filteredReviews.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>Chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {filteredReviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-product-info">
                          <img 
                            src={review.product?.image} 
                            alt={review.product?.name}
                            className="review-product-thumb"
                          />
                          <div>
                            <h3>{review.product?.name}</h3>
                            <p className="review-sku">SKU: {review.product?.sku}</p>
                          </div>
                        </div>
                        <button 
                          className="btn-delete-review"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="review-body">
                        <div className="review-user-info">
                          <div className="review-avatar">
                            {review.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="review-user-name">{review.user?.name}</p>
                            <p className="review-date">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              fill={i < review.rating ? '#fbbf24' : 'none'}
                              color={i < review.rating ? '#fbbf24' : '#d1d5db'}
                            />
                          ))}
                          <span className="rating-number">{review.rating}/5</span>
                        </div>

                        {review.comment && (
                          <div className="review-comment">
                            <MessageSquare size={20} />
                            <p>{review.comment}</p>
                          </div>
                        )}

                        {review.images && review.images.length > 0 && (
                          <div className="review-images">
                            {review.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Review ${idx + 1}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Tên sản phẩm <span className="required">*</span></label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mô tả</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Nhập mô tả sản phẩm"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Giá gốc <span className="required">*</span></label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Giá khuyến mãi</label>
                  <input
                    type="number"
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="VD: DEV-001"
                  />
                </div>

                <div className="form-group">
                  <label>Tồn kho</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục <span className="required">*</span></label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hình ảnh</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="product-image"
                    />
                    <label htmlFor="product-image" className="upload-label">
                      <Upload size={24} />
                      <span>Chọn hình ảnh</span>
                    </label>
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Hủy</button>
              <button className="btn-save" onClick={handleSaveProduct} disabled={formLoading}>
                {formLoading ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <Save size={18} />
                    {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StandaloneDashboard;
