import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, useReducedMotion } from 'framer-motion';
import Header from './ModernHeader';
import Footer from './ModernFooter';
import DynamicBackground from './DynamicBackground';
import AnimationPresets from '../utils/AnimationPresets';
import './Layout.css';

function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  isHomePage = false,
  isMobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuToggle: externalOnMobileMenuToggle,
  customHeader = null,
  customFooter = null,
  className = '',
  fullWidth = false,
  containerClass = '',
  // Animation props
  backgroundVariant = 'gradient',           
  backgroundIntensity = 0.4,                 
  backgroundSpeed = 0.8,                      
  backgroundColors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  enableParallax = true,
  enableMouseEffects = true,
  transitionSpeed = 1,
  disableAnimations = false,
  // New props
  onScrollThreshold = null,
  scrollThreshold = 200,
  enablePullToRefresh = false,
  enableInfiniteScroll = false,
  onInfiniteScroll = null,
  loadingComponent = null,
  errorBoundary = null
}) {
  // State management
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pullToRefreshProgress, setPullToRefreshProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs
  const headerRef = useRef(null);
  const mainContentRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const layoutRef = useRef(null);
  const pullToRefreshRef = useRef(null);
  const infiniteScrollObserverRef = useRef(null);
  const touchStartY = useRef(0);
  
  // Motion values - always created at top level
  const mouseXMotion = useMotionValue(0);
  const mouseYMotion = useMotionValue(0);
  const pullProgress = useMotionValue(0);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Framer Motion scroll animations
  const { scrollY, scrollYProgress } = useScroll({
    target: layoutRef,
    offset: ["start start", "end end"]
  });

  // Transform values for parallax effects
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 5]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);
  const headerShadow = useTransform(scrollYProgress, [0, 0.1], [0, 10]);
  
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200]);
  const backgroundRotate = useTransform(mouseXMotion, [-1, 1], [-5, 5]);
  
  // Mouse transforms
  const rotateX = useTransform(mouseYMotion, [-1, 1], [2, -2]);
  const rotateY = useTransform(mouseXMotion, [-1, 1], [-2, 2]);
  const scaleTransform = useTransform(mouseYMotion, [-1, 1], [1.02, 0.98]);
  const blurTransform = useTransform(scrollY, [0, 500], [0, 5]);
  
  // Overlay opacity based on scroll
  const overlayOpacity = useTransform(scrollY, [0, 500], [0, 0.5]);
  
  // Header Y position based on scroll
  const headerY = useTransform(scrollY, [0, 100], [0, -100]);
  
  // Spring animations for smooth movement
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const smoothBackgroundY = useSpring(backgroundY, springConfig);
  const smoothBackgroundRotate = useSpring(backgroundRotate, springConfig);
  const smoothHeaderShadow = useSpring(headerShadow, springConfig);

  // Memoized values
  const isMobile = useMemo(() => windowSize.width <= 768, [windowSize.width]);
  const isTablet = useMemo(() => windowSize.width > 768 && windowSize.width <= 1024, [windowSize.width]);
  const shouldAnimate = useMemo(() => 
    !disableAnimations && !prefersReducedMotion, 
    [disableAnimations, prefersReducedMotion]
  );

  // Use external props if provided, otherwise use internal state
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined 
    ? externalMobileMenuOpen 
    : internalMobileMenuOpen;
    
  const handleMobileMenuToggle = useCallback(externalOnMobileMenuToggle || 
    (() => setInternalMobileMenuOpen(!isMobileMenuOpen)), 
    [isMobileMenuOpen, externalOnMobileMenuToggle]
  );

  // Close mobile menu when clicking outside
  const handleCloseMobileMenu = useCallback(() => {
    if (externalMobileMenuOpen === undefined) {
      setInternalMobileMenuOpen(false);
    }
  }, [externalMobileMenuOpen]);

  // Track window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    if (!enableMouseEffects || !shouldAnimate || isMobile) return;
    
    const handleMouseMove = (e) => {
      if (layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        mouseXMotion.set(x);
        mouseYMotion.set(y);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseEffects, shouldAnimate, isMobile, mouseXMotion, mouseYMotion]);

  // Measure header height
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
    
    updateHeaderHeight();
    
    resizeObserverRef.current = new ResizeObserver(updateHeaderHeight);
    
    if (headerRef.current) {
      resizeObserverRef.current.observe(headerRef.current);
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [showHeader, isHomePage]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 50;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      // Hide/show header on scroll down/up (mobile only)
      if (isMobile) {
        if (currentScrollY > 100 && currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      
      setIsScrolled(scrolled);
      setLastScrollY(currentScrollY);
      
      // Call scroll threshold callback
      if (onScrollThreshold && currentScrollY > scrollThreshold) {
        onScrollThreshold(currentScrollY);
      }
      
      // Update body class
      if (scrolled) {
        document.body.classList.add('scrolled');
        document.body.classList.add(`scroll-${scrollDirection}`);
      } else {
        document.body.classList.remove('scrolled');
        document.body.classList.remove('scroll-up');
        document.body.classList.remove('scroll-down');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollDirection, isMobile, onScrollThreshold, scrollThreshold]);

  // Pull to refresh functionality
  useEffect(() => {
    if (!enablePullToRefresh || !isMobile) return;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && touchStartY.current) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;
        
        if (diff > 0) {
          e.preventDefault();
          const progress = Math.min(diff / 100, 1);
          setPullToRefreshProgress(progress);
          pullProgress.set(progress);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullToRefreshProgress > 0.7) {
        setIsRefreshing(true);
        try {
          await onInfiniteScroll?.('refresh');
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullToRefreshProgress(0);
      pullProgress.set(0);
      touchStartY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, isMobile, pullToRefreshProgress, onInfiniteScroll, pullProgress]);

  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll || !onInfiniteScroll || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);
          onInfiniteScroll().then((hasMoreItems) => {
            setHasMore(hasMoreItems);
            setIsLoadingMore(false);
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (infiniteScrollObserverRef.current) {
      observer.observe(infiniteScrollObserverRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, onInfiniteScroll, isLoadingMore, hasMore]);

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
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        handleCloseMobileMenu();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, handleCloseMobileMenu]);

  // Memoized styles
  const mainStyle = useMemo(() => {
    if (!showHeader) return {};
    if (isHomePage) {
      return { paddingTop: 0 };
    }
    return { 
      paddingTop: `${headerHeight}px`,
      transition: 'padding-top 0.3s ease'
    };
  }, [showHeader, isHomePage, headerHeight]);

  const backgroundStyle = useMemo(() => ({
    y: smoothBackgroundY,
    rotate: smoothBackgroundRotate,
    scale: scaleTransform,
    filter: `blur(${blurTransform}px)`,
  }), [smoothBackgroundY, smoothBackgroundRotate, scaleTransform, blurTransform]);

  // Overlay background gradient
  const overlayBackground = useMemo(() => 
    `radial-gradient(circle at ${50 + mouseXMotion.get() * 20}% ${50 + mouseYMotion.get() * 20}%, rgba(59,130,246,0.05), transparent 70%)`,
    [mouseXMotion, mouseYMotion]
  );

  // Animation variants
  const pageVariants = useMemo(() => ({
    initial: { 
      opacity: 0,
      y: isMobile ? 10 : 20,
      scale: isMobile ? 1 : 0.98
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: (isMobile ? 0.4 : 0.6) * transitionSpeed,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: isMobile ? 0.05 : 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: isMobile ? -10 : -20,
      scale: isMobile ? 1 : 1.02,
      transition: {
        duration: (isMobile ? 0.3 : 0.4) * transitionSpeed,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }), [isMobile, transitionSpeed]);

  const contentVariants = useMemo(() => ({
    initial: { 
      opacity: 0,
      y: isMobile ? 20 : 30
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: isMobile ? 80 : 100,
        damping: isMobile ? 12 : 15
      }
    }
  }), [isMobile]);

  const pullToRefreshVariants = {
    initial: { y: -100 },
    animate: { 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      y: -100,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      ref={layoutRef}
      className={`layout ${isScrolled ? 'scrolled' : ''} ${scrollDirection} ${className} ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={shouldAnimate ? pageVariants : {}}
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        perspective: shouldAnimate && !isMobile ? 1000 : 'none',
        rotateX: shouldAnimate && !isMobile ? rotateX : 0,
        rotateY: shouldAnimate && !isMobile ? rotateY : 0,
      }}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && isMobile && (
        <AnimatePresence>
          {pullToRefreshProgress > 0 && (
            <motion.div
              ref={pullToRefreshRef}
              className="pull-to-refresh"
              variants={pullToRefreshVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 60,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 1002,
                transform: `translateY(${pullToRefreshProgress * 60 - 60}px)`
              }}
            >
              {isRefreshing ? (
                <>
                  <motion.div 
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 20,
                      height: 20,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      marginRight: 10
                    }}
                  />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <motion.span
                    animate={{ rotate: pullToRefreshProgress * 180 }}
                    style={{ marginRight: 10, fontSize: 20 }}
                  >
                    ↓
                  </motion.span>
                  <span>Pull to refresh</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Dynamic Background */}
      {shouldAnimate && (
        <DynamicBackground
          variant={backgroundVariant}
          intensity={isMobile ? backgroundIntensity * 0.7 : backgroundIntensity}
          speed={isMobile ? backgroundSpeed * 0.5 : backgroundSpeed}
          colors={backgroundColors}
          interactive={enableMouseEffects && !isMobile}
          style={backgroundStyle}
        />
      )}

      {/* Animated overlay */}
      {shouldAnimate && (
        <motion.div 
          className="layout-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: overlayBackground,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: overlayOpacity
          }}
        />
      )}

      {/* Animated particles - reduced on mobile */}
      {shouldAnimate && !isMobile && (
        <div className="layout-particles">
          {[...Array(isMobile ? 10 : 20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: 2,
                height: 2,
                background: `rgba(59,130,246,${0.1 + i * 0.01})`,
                borderRadius: '50%',
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
                filter: 'blur(1px)'
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 2 === 0 ? 10 : -10), 0],
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <motion.div 
          ref={headerRef}
          className={`header-wrapper ${!isVisible ? 'header-hidden' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            y: isMobile ? (isVisible ? 0 : -100) : headerY,
            opacity: headerOpacity,
            scale: headerScale,
            filter: `blur(${headerBlur}px)`,
            boxShadow: smoothHeaderShadow.get() > 0 ? `0 4px 20px rgba(0,0,0,${smoothHeaderShadow.get() / 20})` : 'none',
            transition: 'transform 0.3s ease'
          }}
        >
          {customHeader ? customHeader : (
            <Header 
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuToggle={handleMobileMenuToggle}
              className={`${isScrolled ? 'sticky' : ''} ${scrollDirection}`}
            />
          )}
        </motion.div>
      )}
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
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
            variants={AnimationPresets.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <motion.main 
        ref={mainContentRef}
        className={`main-content ${containerClass} ${isHomePage ? 'home-page' : ''}`}
        id="main-content"
        style={{
          ...mainStyle,
          position: 'relative',
          zIndex: 2,
          minHeight: `calc(100vh - var(--header-height, 0px) - var(--footer-height, 0px))`
        }}
        variants={contentVariants}
      >
        <motion.div 
          className={`container ${fullWidth ? 'full-width' : ''}`}
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {errorBoundary ? (
                <ErrorBoundary fallback={errorBoundary}>
                  {children}
                </ErrorBoundary>
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Scroll progress indicator - hidden on mobile */}
        {shouldAnimate && !isMobile && (
          <motion.div 
            className="scroll-progress"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
              scaleX: scrollYProgress,
              transformOrigin: '0%',
              zIndex: 1001
            }}
          />
        )}
      </motion.main>
      
      {/* Footer */}
      {showFooter && (
        <motion.footer
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: isMobile ? 0.1 : 0.2 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          {customFooter ? customFooter : <Footer />}
        </motion.footer>
      )}

      {/* Infinite scroll sentinel */}
      {enableInfiniteScroll && (
        <div 
          ref={infiniteScrollObserverRef}
          style={{ height: 20, width: '100%' }}
        />
      )}

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && loadingComponent && (
        <div className="infinite-scroll-loading">
          {loadingComponent}
        </div>
      )}

      {/* Back to top button - hidden on mobile */}
      {shouldAnimate && !isMobile && (
        <AnimatePresence>
          {isScrolled && (
            <motion.button
              className="back-to-top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variants={AnimationPresets.fadeInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'fixed',
                bottom: 30,
                right: 30,
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}
              aria-label="Back to top"
            >
              ↑
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Mobile bottom navigation spacer */}
      {isMobile && (
        <div style={{ height: 60 }} />
      )}
    </motion.div>
  );
}

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Animation variants for children
const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 30 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    transition: {
      duration: 0.3
    }
  }
};

export default Layout;