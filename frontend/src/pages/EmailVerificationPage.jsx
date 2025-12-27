import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './EmailVerificationPage.css';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('').filter(char => /^\d$/.test(char));
    
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpString })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully! Logging you in...');
        
        // Store token and user
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth store
        login(email, ''); // Token is already set
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/resend-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Verification code sent! Please check your email.');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <h1>Verify Your Email</h1>
            <p>We've sent a 6-digit code to:</p>
            <strong>{email}</strong>
          </div>

          <form onSubmit={handleVerify} className="verification-form">
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpInputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="verify-button"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="resend-button"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="back-button"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
