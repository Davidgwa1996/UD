import React, { useState, useEffect, useRef } from 'react';
import Header from './ModernHeader';
import Footer from './ModernFooter';
import './Layout.css';

function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  isHomePage = false, // When true, removes top padding and disables sticky header offset
  // Optional mobile menu props
  isMobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuToggle: externalOnMobileMenuToggle,
  // Optional custom header/footer
  customHeader = null,
  customFooter = null,
  // Additional props
  className = '',
  fullWidth = false,
  containerClass = ''
}) {
  // Internal state for mobile menu if not controlled externally
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const mainContentRef = useRef(null);
  const resizeObserverRef = useRef(null);
  
  // Use external props if provided, otherwise use internal state
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined 
    ? externalMobileMenuOpen 
    : internalMobileMenuOpen;
    
  const handleMobileMenuToggle = externalOnMobileMenuToggle || 
    (() => setInternalMobileMenuOpen(!isMobileMenuOpen));

  // Close mobile menu when clicking outside (if internally controlled)
  const handleCloseMobileMenu = () => {
    if (externalMobileMenuOpen === undefined) {
      setInternalMobileMenuOpen(false);
    }
  };

  // Measure header height for proper spacing – only needed when header is shown and NOT on homepage
  useEffect(() => {
    if (!showHeader || isHomePage) {
      setHeaderHeight(0);
      return;
    }

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    
    // Initial measurement
    updateHeaderHeight();
    
    // ResizeObserver for dynamic header height changes
    resizeObserverRef.current = new ResizeObserver(updateHeaderHeight);
    
    if (headerRef.current) {
      resizeObserverRef.current.observe(headerRef.current);
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [showHeader, isHomePage]); // Re-run if homepage status changes

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      if (scrolled) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (externalMobileMenuOpen === undefined && isMobileMenuOpen) {
        setInternalMobileMenuOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isMobileMenuOpen, externalMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // improve mobile scroll prevention
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  // Determine main content padding based on header and homepage
  const mainStyle = (() => {
    if (!showHeader) return {};
    if (isHomePage) {
      return { paddingTop: 0 }; // explicit zero – overrides any CSS
    }
    return { paddingTop: `${headerHeight}px` };
  })();

  return (
    <div className={`layout ${isScrolled ? 'scrolled' : ''} ${className}`}>
      {showHeader && (
        <div ref={headerRef}>
          {customHeader ? customHeader : (
            <Header 
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuToggle={handleMobileMenuToggle}
              className={isScrolled ? 'sticky' : ''}
            />
          )}
        </div>
      )}
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={handleCloseMobileMenu}
          aria-label="Close menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCloseMobileMenu();
            }
          }}
        />
      )}
      
      <main 
        ref={mainContentRef}
        className={`main-content ${containerClass} ${isHomePage ? 'home-page' : ''}`}
        id="main-content"
        style={mainStyle}
      >
        <div className={`container ${fullWidth ? 'full-width' : ''}`}>
          {children}
        </div>
      </main>
      
      {showFooter && (
        <>
          {customFooter ? customFooter : <Footer />}
        </>
      )}
    </div>
  );
}

export default Layout;