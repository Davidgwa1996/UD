import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import VerifyEmail from './pages/VerifyEmail';
import NotFoundPage from './pages/NotFoundPage';
import AnimationPresets from './utils/AnimationPresets';
import './App.css';

// ============================================
// LOADING SCREEN COMPONENT - MINIMAL ANIMATIONS
// ============================================
const LoadingScreen = ({ progress = 0 }) => (
  <div className="loading-screen">
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
    </div>
    
    <div className="loading-text">
      Loading UniDigital Marketplace...
    </div>
    
    {/* Progress bar - static */}
    <div 
      className="loading-progress"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// ============================================
// ERROR BOUNDARY COMPONENT - STATIC
// ============================================
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
          <div className="error-icon">⚠️</div>
          <h3>Component Error</h3>
          <p>This section encountered an issue but the rest of the app continues to work.</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            className="error-reload-btn"
          >
            Reload Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================
// PAGE TRANSITION WRAPPER - SUBTLE
// ============================================
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// SAFE COMPONENT WRAPPER
// ============================================
const createSafeComponent = (Component, fallbackName = 'Component') => {
  return (props) => {
    try {
      if (!Component || typeof Component !== 'function') {
        throw new Error(`Component ${fallbackName} is not available`);
      }
      return (
        <ErrorBoundary>
          <Suspense fallback={
            <div className="suspense-fallback">
              <div className="suspense-spinner" />
              <p>Loading {fallbackName}...</p>
            </div>
          }>
            <Component {...props} />
          </Suspense>
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

// Create safe components (all original imports preserved)
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
const SafeVerifyEmail = createSafeComponent(VerifyEmail, 'VerifyEmail');
const SafeNotFoundPage = createSafeComponent(NotFoundPage, 'NotFoundPage');

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    if (!isAppReady) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isAppReady]);

  // Initialize app
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const hideLoadingScreen = () => {
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          setTimeout(() => {
            loadingElement.style.display = 'none';
          }, 500);
        }, 500);
      }
    };

    const initTimer = setTimeout(() => {
      setIsAppReady(true);
      hideLoadingScreen();
    }, 1500);

    const forceReadyTimer = setTimeout(() => {
      setIsAppReady(true);
      hideLoadingScreen();
    }, 4000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(forceReadyTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isAppReady) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (!isOnline) {
    return (
      <div className="offline-screen">
        <span className="offline-icon">📡</span>
        <h2>You're Offline</h2>
        <p>Please check your internet connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="offline-retry-btn"
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
          {/* Global notification system */}
          <div id="notification-container" className="notification-container" />
          
          <PageTransition>
            <Routes>
              {/* Home */}
              <Route path="/" element={<SafeHomePage />} />
              
              {/* Auth */}
              <Route path="/auth" element={
                <SafeLayout showHeader={true} showFooter={true}>
                  <SafeAuthPage />
                </SafeLayout>
              } />
              
              {/* Email Verification – standalone page (no header/footer) */}
              <Route path="/verify-email/:token" element={<SafeVerifyEmail />} />
              
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
          </PageTransition>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

// Export with hot module replacement support
export default App;