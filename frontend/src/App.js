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
import GlobalPaymentMethods from './pages/GlobalPaymentMethods';
import ContactPage from './pages/ContactPage';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// Loading Screen Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <div className="loading-text">Loading UniDigital Marketplace...</div>
  </div>
);

// Error Boundary
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
        <div className="error-boundary">
          <h3>Component Error</h3>
          <p>This section encountered an issue but the rest of the app continues to work.</p>
          <button 
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

// Safe wrapper components
const createSafeComponent = (Component, fallbackName = 'Component') => {
  return (props) => {
    try {
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
        <div className="component-error">
          <h2>{fallbackName}</h2>
          <p>This component is temporarily unavailable.</p>
          <p>We're working to restore this feature. Please try again later.</p>
        </div>
      );
    }
  };
};

// Create safe components
const SafeLayout = createSafeComponent(Layout, 'Layout');
const SafeHomePage = createSafeComponent(HomePage, 'HomePage');
const SafeProductsPage = createSafeComponent(ProductsPage, 'ProductsPage');
const SafeProductDetailPage = createSafeComponent(ProductDetailPage, 'ProductDetailPage');
const SafeCartPage = createSafeComponent(CartPage, 'CartPage');
const SafeCheckoutPage = createSafeComponent(CheckoutPage, 'CheckoutPage');
const SafeCheckoutSuccessPage = createSafeComponent(CheckoutSuccessPage, 'CheckoutSuccessPage');
const SafeCategoryPage = createSafeComponent(CategoryPage, 'CategoryPage');
const SafeGlobalPaymentMethods = createSafeComponent(GlobalPaymentMethods, 'GlobalPaymentMethods');
const SafeContactPage = createSafeComponent(ContactPage, 'ContactPage');
const SafeMarketAnalysisPage = createSafeComponent(MarketAnalysisPage, 'MarketAnalysisPage');
const SafeAuthPage = createSafeComponent(AuthPage, 'AuthPage');
const SafeNotFoundPage = createSafeComponent(NotFoundPage, 'NotFoundPage');

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize app
  useEffect(() => {
    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide loading screen
    const hideLoadingScreen = () => {
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        setTimeout(() => {
          loadingElement.style.display = 'none';
        }, 500);
      }
    };

    // App initialization
    const initTimer = setTimeout(() => {
      setIsAppReady(true);
      hideLoadingScreen();
    }, 1000);

    // Force ready after max 3 seconds
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

  // Show loading screen
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  // Show offline warning
  if (!isOnline) {
    return (
      <div className="offline-screen">
        <h2>You're Offline</h2>
        <p>Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()}>
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
            {/* HOME – no outer Layout (HomePage already includes its own Layout with isHomePage=true) */}
            <Route path="/" element={<SafeHomePage />} />
            
            {/* Auth */}
            <Route path="/auth" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeAuthPage />
              </SafeLayout>
            } />
            
            {/* Global Payment Methods */}
            <Route path="/global-payments" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeGlobalPaymentMethods />
              </SafeLayout>
            } />
            
            {/* Products */}
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
            
            {/* Cart & Checkout */}
            <Route path="/cart" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCartPage />
              </SafeLayout>
            } />
            
            <Route path="/checkout" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCheckoutPage />
              </SafeLayout>
            } />
            
            <Route path="/checkout-success" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCheckoutSuccessPage />
              </SafeLayout>
            } />
            
            {/* Categories */}
            <Route path="/category/:category" element={
              <SafeLayout showHeader={true} showFooter={true}>
                <SafeCategoryPage />
              </SafeLayout>
            } />
            
            {/* Other Pages */}
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
            
            {/* Redirects for old routes */}
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/payment" element={<Navigate to="/global-payments" replace />} />
            <Route path="/payment-gateway" element={<Navigate to="/global-payments" replace />} />
            
            {/* 404 */}
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

// Critical CSS (unchanged – keep as is)
const criticalCSS = `
  /* ... (your existing critical CSS) ... */
`;

// Inject critical CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

export default App;