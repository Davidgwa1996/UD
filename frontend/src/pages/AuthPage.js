import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModernFooter from '../components/ModernFooter';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Password strength check
  const checkPasswordStrength = (password) => {
    if (password.length < 8) return 'weak';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  // Handle password change
  const handlePasswordChange = (value) => {
    setPassword(value);
    if (!isLogin) {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // API Service - Mock implementation (replace with real API calls)
  const api = {
    login: async (email, password) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'test@example.com' && password === 'password123') {
        return {
          token: 'mock_jwt_token_here',
          user: {
            id: 1,
            name: 'Test User',
            email: email,
            role: 'user'
          }
        };
      } else {
        throw new Error('Invalid email or password');
      }
    },
    
    register: async (userData) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userData.email && userData.password) {
        return {
          success: true,
          message: 'Registration successful'
        };
      } else {
        throw new Error('Registration failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const strength = checkPasswordStrength(password);
      if (strength === 'weak') {
        setError('Password is too weak. Use at least 8 characters with uppercase letters and numbers');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Login
        const response = await api.login(email, password);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Register
        const response = await api.register({ 
          name: name.trim(), 
          email: email.trim(), 
          password 
        });
        setSuccess('Registration successful! You can now login.');
        // Clear form
        setName('');
        setPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth (implement based on your backend)
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleAppleLogin = () => {
    setError('Apple login will be implemented soon.');
  };

  // Password strength indicator
  const renderPasswordStrength = () => {
    if (!password || isLogin) return null;
    
    const strength = passwordStrength;
    const strengthText = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong'
    }[strength];
    
    const strengthColor = {
      weak: '#ff4757',
      medium: '#ffa502',
      strong: '#2ed573'
    }[strength];
    
    return (
      <div className="password-strength">
        <div className="strength-bar">
          <div 
            className="strength-fill" 
            style={{
              width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
              backgroundColor: strengthColor
            }}
          />
        </div>
        <span className="strength-text" style={{ color: strengthColor }}>
          {strengthText} Password
        </span>
      </div>
    );
  };

  return (
    <div className="auth-page">
      <main className="auth-content">
        <div className="auth-container">
          {/* Left Column: Info */}
          <div className="auth-info">
            <div className="auth-logo">
              <span>🌍</span>
              <span>UD</span>
            </div>
            <h1>Welcome to UniDigital</h1>
            <p className="auth-subtitle">
              Join the global marketplace for AI-priced cars and electronics
            </p>
            
            <div className="auth-features">
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <div className="feature-content">
                  <strong>AI-Powered Pricing</strong>
                  <p>Real-time market analysis for the best prices</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">🌍</span>
                <div className="feature-content">
                  <strong>Global Marketplace</strong>
                  <p>Shop from verified sellers worldwide</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <div className="feature-content">
                  <strong>Secure Transactions</strong>
                  <p>Protected payments and buyer guarantees</p>
                </div>
              </div>
              
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div className="feature-content">
                  <strong>Fast Shipping</strong>
                  <p>International delivery with tracking</p>
                </div>
              </div>
            </div>
            
            <div className="auth-stats">
              <div className="stat">
                <strong>50K+</strong>
                <span>Products</span>
              </div>
              <div className="stat">
                <strong>98.7%</strong>
                <span>AI Accuracy</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Sign in to your account' : 'Join our global marketplace'}</p>
            </div>

            {/* OAuth Buttons */}
            <div className="oauth-buttons">
              <button 
                type="button" 
                className="oauth-btn google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="oauth-icon">G</span>
                Continue with Google
              </button>
              <button 
                type="button" 
                className="oauth-btn apple-btn"
                onClick={handleAppleLogin}
                disabled={loading}
              >
                <span className="oauth-icon">🍎</span>
                Continue with Apple
              </button>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  ✅ {success}
                </div>
              )}

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={email && !validateEmail(email) ? 'invalid' : ''}
                />
                {email && !validateEmail(email) && (
                  <small className="error-text">Please enter a valid email</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength="6"
                />
                {renderPasswordStrength()}
                {isLogin && (
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                )}
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!isLogin}
                    disabled={loading}
                    className={confirmPassword && password !== confirmPassword ? 'invalid' : ''}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <small className="error-text">Passwords do not match</small>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    disabled={loading}
                  />
                  <label htmlFor="terms">
                    I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading">
                    <span className="spinner"></span>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle between Login/Signup */}
            <div className="auth-toggle">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setPasswordStrength('');
                }}
                disabled={loading}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>

            {/* Additional Links */}
            <div className="auth-links">
              <Link to="/" className="back-home">
                ← Back to Home
              </Link>
              <Link to="/contact" className="help-link">
                Need Help?
              </Link>
            </div>

            {/* Demo Credentials */}
            {isLogin && (
              <div className="demo-credentials">
                <p><strong>Demo Account:</strong></p>
                <p>Email: test@example.com</p>
                <p>Password: password123</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
};

export default AuthPage;