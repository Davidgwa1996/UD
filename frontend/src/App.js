import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CategoryPage from './pages/CategoryPage';
import PaymentGateway from './pages/PaymentGateway';
import ContactPage from './pages/ContactPage';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// Add loading screen component
const LoadingScreen = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid #334155',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }}></div>
    <div style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Loading UniDigital Marketplace...</div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Enhanced Error Boundary with better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#1e293b',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#f8fafc',
          textAlign: 'center'
        }}>
          <h3>Component Error</h3>
          <p>This section encountered an issue but the rest of the app continues to work.</p>
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Reload Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe wrapper components that gracefully handle missing imports
const createSafeComponent = (Component, fallbackName = 'Component') => {
  return (props) => {
    try {
      // Check if component exists
      if (!Component || typeof Component !== 'function') {
        throw new Error(`Component ${fallbackName} is not available`);
      }
      
      return (
        <ErrorBoundary>
          <Component {...props} />
        </ErrorBoundary>
      );
    } catch (error) {
      console.warn(`Failed to load ${fallbackName}:`, error);
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>{fallbackName}</h2>
          <p>This component is temporarily unavailable.</p>
          <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>
            We're working to restore this feature. Please try again later.
          </p>
        </div>
      );
    }
  };
};

// Create safe components for all imported components
const SafeLayout = createSafeComponent(Layout, 'Layout');
const SafeHomePage = createSafeComponent(HomePage, 'HomePage');
const SafeProductsPage = createSafeComponent(ProductsPage, 'ProductsPage');
const SafeProductDetailPage = createSafeComponent(ProductDetailPage, 'ProductDetailPage');
const SafeCartPage = createSafeComponent(CartPage, 'CartPage');
const SafeCheckoutPage = createSafeComponent(CheckoutPage, 'CheckoutPage');
const SafeCheckoutSuccessPage = createSafeComponent(CheckoutSuccessPage, 'CheckoutSuccessPage');
const SafeCategoryPage = createSafeComponent(CategoryPage, 'CategoryPage');
const SafePaymentGateway = createSafeComponent(PaymentGateway, 'PaymentGateway');
const SafeContactPage = createSafeComponent(ContactPage, 'ContactPage');
const SafeMarketAnalysisPage = createSafeComponent(MarketAnalysisPage, 'MarketAnalysisPage');
const SafeAuthPage = createSafeComponent(AuthPage, 'AuthPage');
const SafeNotFoundPage = createSafeComponent(NotFoundPage, 'NotFoundPage');

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize app
  useEffect(() => {
    // Check network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide any existing loading screen from index.html
    const hideLoadingScreen = () => {
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        setTimeout(() => {
          loadingElement.style.display = 'none';
        }, 500);
      }
    };

    // Simulate app initialization
    const initTimer = setTimeout(() => {
      setIsAppReady(true);
      hideLoadingScreen();
    }, 1000);

    // Force ready after max 3 seconds to prevent infinite loading
    const forceReadyTimer = setTimeout(() => {
      setIsAppReady(true);
      hideLoadingScreen();
    }, 3000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(forceReadyTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading screen while app initializes
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  // Show offline warning
  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#f8fafc',
        padding: '20px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>You're Offline</h2>
        <p style={{ color: '#94a3b8', marginBottom: '20px', maxWidth: '500px' }}>
          Please check your internet connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <Routes>
            {/* Main routes with Layout wrapper */}
            <Route path="/" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeHomePage />
              </SafeLayout>
            } />
            
            <Route path="/auth" element={
              <SafeLayout showHeader={false} showFooter={false}>
                <SafeAuthPage />
              </SafeLayout>
            } />
            
            <Route path="/products" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeProductsPage />
              </SafeLayout>
            } />
            
            <Route path="/product/:id" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeProductDetailPage />
              </SafeLayout>
            } />
            
            <Route path="/cart" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCartPage />
              </SafeLayout>
            } />
            
            <Route path="/checkout" element={
              <SafeLayout showHeader={true} showFooter={false}>
                <SafeCheckoutPage />
              </SafeLayout>
            } />
            
            <Route path="/checkout-success" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCheckoutSuccessPage />
              </SafeLayout>
            } />
            
            <Route path="/category/:category" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCategoryPage />
              </SafeLayout>
            } />
            
            <Route path="/payment" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafePaymentGateway />
              </SafeLayout>
            } />
            
            <Route path="/contact" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeContactPage />
              </SafeLayout>
            } />
            
            <Route path="/market-analysis" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeMarketAnalysisPage />
              </SafeLayout>
            } />
            
            {/* Redirect /checkout-success to home if accessed directly */}
            <Route path="/checkout-success" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCheckoutSuccessPage />
              </SafeLayout>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeNotFoundPage />
              </SafeLayout>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

// Add critical CSS to prevent white screen - Updated for mobile responsiveness
const criticalCSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .App {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  /* Mobile menu styles */
  .mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
  }

  .mobile-menu {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    background: rgba(15, 15, 30, 0.98);
    backdrop-filter: blur(20px);
    z-index: 1000;
    transition: left 0.3s ease;
    padding: 2rem 1.5rem;
    overflow-y: auto;
  }

  .mobile-menu.active {
    left: 0;
  }

  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0,
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .mobile-menu-overlay.active {
    opacity: 1;
    visibility: visible;
  }

  /* Cart styles */
  .cart-icon {
    position: relative;
    cursor: pointer;
  }

  .cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4757;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Ensure all images have fallbacks */
  img {
    max-width: 100%;
    height: auto;
    object-fit: cover;
  }

  /* Product image fallback */
  .product-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
  }

  /* Basic link styling */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Button styles for mobile */
  button {
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
  }

  /* Mobile-first responsive design */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    .mobile-menu-toggle {
      display: block;
    }

    /* Products grid for mobile */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    /* Cart items on mobile */
    .cart-item {
      flex-direction: column;
      align-items: flex-start;
    }

    /* Payment options for mobile */
    .payment-options {
      grid-template-columns: 1fr;
    }

    /* Single column layout on mobile */
    .featured-grid {
      grid-template-columns: 1fr !important;
    }
    
    .sidebar-card {
      flex-direction: column !important;
    }
    
    .sidebar-image {
      width: 100% !important;
      height: 150px !important;
    }
  }

  @media (max-width: 480px) {
    .products-grid {
      grid-template-columns: 1fr;
    }

    /* Full-width buttons on mobile */
    .btn-block {
      width: 100%;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    button, 
    .nav-item,
    .mobile-menu-toggle {
      min-height: 44px;
      min-width: 44px;
    }

    /* Remove hover effects for touch devices */
    .product-card:hover {
      transform: none;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Inject critical CSS immediately
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

export default App;