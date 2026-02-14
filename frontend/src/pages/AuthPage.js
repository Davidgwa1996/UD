import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModernFooter from '../components/ModernFooter';
import './AuthPage.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkPasswordStrength = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length >= 8 && hasLower && hasUpper && hasNumber) return 'strong';
    if (password.length >= 6 && hasLower && hasUpper && hasNumber) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (!isLogin) setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your first and last name');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!acceptTerms) {
        setError('You must accept the Terms of Service');
        setLoading(false);
        return;
      }
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasUpper || !hasLower || !hasNumber) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Combine first and last name into a single 'name' field
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

        const response = await axios.post(`${API_BASE}/auth/register`, {
          name: fullName,
          email: email.trim(),
          password,
          acceptTerms: 'true',      // must be string 'true'
          market: 'US',
          // phone is optional, omit if not needed
        });

        setSuccess('Registration successful! You can now login.');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAcceptTerms(false);
        setPasswordStrength('');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Full error:', err.response?.data);
      const message = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleAppleLogin = () => {
    setError('Apple login is not yet available. Please use Google or email.');
  };

  const renderPasswordStrength = () => {
    if (!password || isLogin) return null;
    const strength = passwordStrength;
    const strengthText = { weak: 'Weak', medium: 'Medium', strong: 'Strong' }[strength];
    const strengthColor = { weak: '#ff4757', medium: '#ffa502', strong: '#2ed573' }[strength];
    return (
      <div className="password-strength">
        <div className="strength-bar">
          <div className="strength-fill" style={{ width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%', backgroundColor: strengthColor }} />
        </div>
        <span className="strength-text" style={{ color: strengthColor }}>{strengthText} Password</span>
      </div>
    );
  };

  return (
    <div className="auth-page">
      <main className="auth-content">
        <div className="auth-container">
          {/* Left info column (unchanged) */}
          <div className="auth-info">
            <div className="auth-logo"><span>🌍</span><span>UD</span></div>
            <h1>Welcome to UniDigital</h1>
            <p className="auth-subtitle">Join the global marketplace for AI-priced cars and electronics</p>
            <div className="auth-features">
              {[
                { icon: '🤖', title: 'AI-Powered Pricing', desc: 'Real-time market analysis for the best prices' },
                { icon: '🌍', title: 'Global Marketplace', desc: 'Shop from verified sellers worldwide' },
                { icon: '🛡️', title: 'Secure Transactions', desc: 'Protected payments and buyer guarantees' },
                { icon: '🚚', title: 'Fast Shipping', desc: 'International delivery with tracking' }
              ].map((f, i) => (
                <div key={i} className="feature">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-content"><strong>{f.title}</strong><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="auth-stats">
              <div className="stat"><strong>50K+</strong><span>Products</span></div>
              <div className="stat"><strong>98.7%</strong><span>AI Accuracy</span></div>
              <div className="stat"><strong>24/7</strong><span>Support</span></div>
            </div>
          </div>

          {/* Right form column */}
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Sign in to your account' : 'Join our global marketplace'}</p>
            </div>

            <div className="oauth-buttons">
              <button type="button" className="oauth-btn google-btn" onClick={handleGoogleLogin} disabled={loading}>
                <span className="oauth-icon">G</span> Continue with Google
              </button>
              <button type="button" className="oauth-btn apple-btn" onClick={handleAppleLogin} disabled={loading}>
                <span className="oauth-icon">🍎</span> Continue with Apple
              </button>
            </div>

            <div className="divider"><span>or</span></div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              {success && <div className="alert alert-success">✅ {success}</div>}

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </>
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
                {email && !validateEmail(email) && <small className="error-text">Please enter a valid email</small>}
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
                {isLogin && <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>}
              </div>

              {!isLogin && (
                <>
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
                    {confirmPassword && password !== confirmPassword && <small className="error-text">Passwords do not match</small>}
                  </div>
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                      disabled={loading}
                    />
                    <label htmlFor="terms">
                      I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                    </label>
                  </div>
                </>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="loading"><span className="spinner"></span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

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

            <div className="auth-links">
              <Link to="/" className="back-home">← Back to Home</Link>
              <Link to="/contact" className="help-link">Need Help?</Link>
            </div>
          </div>
        </div>
      </main>
      <ModernFooter />
    </div>
  );
};

export default AuthPage;