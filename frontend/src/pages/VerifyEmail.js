import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Use environment variable or fallback
const API_BASE = process.env.REACT_APP_API_URL || 'https://unidigitalcom-backend.onrender.com/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log('🔐 Verifying token:', token);
        const response = await axios.get(`${API_BASE}/auth/verify-email/${token}`);
        console.log('✅ Verification response:', response.data);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/auth'), 3000);
      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          error.message ||
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Resend verification email
  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const email = prompt('Enter your email to resend verification:');
      if (!email) throw new Error('Email is required');
      const response = await axios.post(`${API_BASE}/auth/resend-verification`, { email });
      setResendMessage(response.data.message || 'Verification email sent');
    } catch (error) {
      console.error('❌ Resend error:', error);
      setResendMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to resend verification email'
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Inline styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '3px solid #334155',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  };

  const buttonStyle = {
    display: 'inline-block',
    background: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background 0.2s',
  };

  // Loading state
  if (status === 'verifying') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={spinnerStyle}></div>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Verifying your email...</h2>
          <p style={{ color: '#94a3b8' }}>Please wait while we verify your email address.</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '64px', marginBottom: '20px', color: '#4ade80' }}>✅</div>
          <h2 style={{ fontSize: '24px', color: '#4ade80', marginBottom: '10px' }}>Email Verified!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{message}</p>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Redirecting to login in 3 seconds...</p>
          <Link to="/auth" style={buttonStyle}>Go to Login Now</Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px', color: '#f87171' }}>❌</div>
        <h2 style={{ fontSize: '24px', color: '#f87171', marginBottom: '10px' }}>Verification Failed</h2>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{message}</p>

        <p style={{ color: '#94a3b8', marginBottom: '10px' }}>
          Need a new verification email?{' '}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {resendLoading ? 'Sending...' : 'Resend'}
          </button>
        </p>

        {resendMessage && <p style={{ color: '#a5b4fc', marginTop: '10px' }}>{resendMessage}</p>}

        <Link to="/auth" style={buttonStyle}>Back to Login</Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
