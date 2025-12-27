import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';

// Pages
import HomePage from './pages/HomePage-schon';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import OrdersPage from './pages/OrdersPage';
import MyReviewsPage from './pages/MyReviewsPage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import TailwindDemo from './components/TailwindDemo';
import AuthPage from './pages/AuthPage';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import StandaloneDashboard from './pages/StandaloneDashboard';

import './styles/global.css';
import './styles/soft-theme.css';

// Component để xử lý auth logout event
const AuthHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate('/auth');
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout, navigate]);
  
  return null;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Layout wrapper for regular pages
  const RegularLayout = ({ children }) => (
    <div className="app">
      <Navigation key={user?.id || 'guest'} />
      {children}
      <Footer />
      <BackToTopButton />
      <ChatWidget />
    </div>
  );

  return (
    <Router>
      <AuthHandler />
      <Routes>
        {/* Admin Routes - WITHOUT Navigation/Footer */}
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <StandaloneDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Auth Routes - WITHOUT Navigation/Footer */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        {/* Regular Routes - WITH Navigation/Footer */}
        <Route path="/" element={<RegularLayout><HomePage /></RegularLayout>} />
        <Route path="/products" element={<RegularLayout><ProductsPage /></RegularLayout>} />
        <Route path="/products/:id" element={<RegularLayout><ProductDetailPage /></RegularLayout>} />
        <Route path="/cart" element={<RegularLayout><CartPage /></RegularLayout>} />
        <Route path="/contact" element={<RegularLayout><ContactPage /></RegularLayout>} />
        <Route path="/forgot-password" element={<RegularLayout><ForgotPasswordPage /></RegularLayout>} />
        <Route path="/demo" element={<RegularLayout><TailwindDemo /></RegularLayout>} />
        
        {/* Protected Routes with Layout */}
        <Route
          path="/orders"
          element={
            <RegularLayout>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </RegularLayout>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <RegularLayout>
              <ProtectedRoute>
                <MyReviewsPage />
              </ProtectedRoute>
            </RegularLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <RegularLayout>
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            </RegularLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
