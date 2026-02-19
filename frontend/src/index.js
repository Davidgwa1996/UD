// src/index.js - Optimized for Immediate Loading with Animations ONLY on Promo Sections
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// ============================================
// CRITICAL CSS INJECTION - Loads Immediately
// ============================================
const criticalCSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  body {
    margin: 0;
    background: #0f0f1e;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    min-height: 100vh;
  }

  #root {
    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  }

  /* Loading Screen - NO animations */
  #app-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0f0f1e;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 229, 255, 0.1);
    border-top: 3px solid #00e5ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .loading-text {
    color: #94a3b8;
    font-size: 1.2rem;
    text-align: center;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .hidden {
    display: none !important;
  }

  /* Toast Container */
  .toast-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9998;
  }
`;

// Inject critical CSS immediately
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

// ============================================
// ERROR BOUNDARY - NO ANIMATIONS
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
    console.error('React Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error reporting service if available
    if (window.errorReportingService) {
      window.errorReportingService.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0f0f1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 10000
        }}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Static error icon - NO animation */}
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '15px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              color: '#94a3b8', 
              marginBottom: '25px',
              lineHeight: '1.6'
            }}>
              The application encountered an error. Don't worry, your data is safe.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ↻ Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🏠 Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '6px',
                textAlign: 'left',
                maxHeight: '150px',
                overflowY: 'auto',
                fontSize: '12px'
              }}>
                <strong>Error Details (Development):</strong>
                <pre style={{ marginTop: '10px', color: '#ef4444' }}>
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// ROOT ELEMENT CHECK & INITIALIZATION
// ============================================
const rootElement = document.getElementById('root');

// Show error if root element not found
if (!rootElement) {
  console.error('Root element (#root) not found in document');
  
  // Create emergency error display
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f0f1e, #1a1a2e);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: white;
      text-align: center;
      z-index: 99999;
    ">
      <div style="max-width: 500px;">
        <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: #ef4444;">🚨 Critical Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 30px; color: #94a3b8;">
          Unable to find the application root element.
          Please check if the HTML structure is correct or contact support.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            🔄 Refresh Page
          </button>
          <button onclick="window.location.href='/'" style="
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            🏠 Go to Home
          </button>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 0.9rem; color: #94a3b8;">
            If this error persists, please clear your browser cache and cookies.
          </p>
        </div>
      </div>
    </div>
  `;
} else {
  // ============================================
  // GLOBAL ERROR HANDLING
  // ============================================
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    event.preventDefault();
    
    // Don't show error dialog in production for minor errors
    if (process.env.NODE_ENV === 'production') {
      return;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });

  // Network status monitoring
  window.addEventListener('online', () => {
    console.log('Application is back online');
  });

  window.addEventListener('offline', () => {
    console.warn('Application is offline');
  });

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  if (process.env.NODE_ENV === 'production') {
    // Report Web Vitals (optional)
    const reportWebVitals = (metric) => {
      console.log('Performance Metric:', metric.name, metric.value);
      
      // Send to analytics service
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          non_interaction: true,
        });
      }
    };

    // Monitor Core Web Vitals
    if (window.PerformanceObserver) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            reportWebVitals({ name: 'LCP', value: lastEntry.startTime });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            reportWebVitals({ 
              name: 'FID', 
              value: entry.processingStart - entry.startTime 
            });
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          let clsValue = 0;
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          if (clsValue > 0) {
            reportWebVitals({ name: 'CLS', value: clsValue });
          }
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('Web Vitals monitoring error:', e);
      }
    }
  }

  // ============================================
  // SERVICE WORKER UNREGISTRATION (Fix Render 404)
  // ============================================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker unregistered:', registration);
      }
    }).catch((error) => {
      console.error('ServiceWorker unregistration failed:', error);
    });
  }

  // ============================================
  // THEME MANAGEMENT
  // ============================================
  const getPreferredTheme = () => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('unidigital-theme');
      if (storedTheme) return storedTheme;
      
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  // Apply theme immediately
  if (typeof document !== 'undefined') {
    const theme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(theme);
  }

  // ============================================
  // REACT APP RENDERING
  // ============================================
  const root = ReactDOM.createRoot(rootElement);
  
  // Function to hide loading screen
  const hideLoadingScreen = () => {
    const loadingElement = document.getElementById('app-loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    // Also hide any default loading screen from index.html
    const defaultLoading = document.getElementById('loading');
    if (defaultLoading) {
      defaultLoading.style.display = 'none';
    }
  };

  // Hide loading screen after a timeout (fallback)
  const loadingTimeout = setTimeout(() => {
    hideLoadingScreen();
  }, 5000); // Max 5 seconds

  // Render the application
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <CartProvider>
          <App />
          <Toaster 
            position="top-right"
            gutter={12}
            containerStyle={{
              top: 80,
              right: 20,
              zIndex: 9999
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(55, 65, 81, 0.95))',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                borderLeft: '4px solid #667eea',
                maxWidth: '420px',
              },
              success: {
                style: {
                  background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(4, 120, 87, 0.95))',
                  borderLeft: '4px solid #10b981',
                },
                icon: '✅',
                duration: 5000,
              },
              error: {
                style: {
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95))',
                  borderLeft: '4px solid #ef4444',
                },
                icon: '❌',
                duration: 6000,
              },
              loading: {
                style: {
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(67, 56, 202, 0.95))',
                  borderLeft: '4px solid #6366f1',
                },
                icon: '⏳',
                duration: Infinity,
              },
            }}
          />
        </CartProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Hide loading screen when React is ready
  setTimeout(() => {
    hideLoadingScreen();
    clearTimeout(loadingTimeout);
  }, 1000); // Hide after 1 second

  // ============================================
  // STARTUP LOGS
  // ============================================
  console.log(`
    🚀 UniDigital Marketplace
    =================================
    Version: 2.0.0
    Environment: ${process.env.NODE_ENV || 'development'}
    Build Date: ${new Date().toISOString().split('T')[0]}
    User Agent: ${navigator.userAgent}
    Animations: Active ONLY on promo sections
    =================================
  `);
}

// ============================================
// PERFORMANCE MARKERS
// ============================================
if (typeof performance !== 'undefined' && performance.mark) {
  performance.mark('index-js-loaded');
  performance.measure('index-js-execution', 'navigationStart', 'index-js-loaded');
}

// Export for testing if needed
export { ErrorBoundary };