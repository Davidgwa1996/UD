import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
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
  // New animation props
  backgroundVariant = 'gradient',           
  backgroundIntensity = 0.4,                 
  backgroundSpeed = 0.8,                      
  backgroundColors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  enableParallax = true,
  enableMouseEffects = true,
  transitionSpeed = 1,
  disableAnimations = false                    
}) {
  // Internal state for mobile menu if not controlled externally
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const headerRef = useRef(null);
  const mainContentRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const layoutRef = useRef(null);
  
  // Motion values for mouse position - always created at top level
  const mouseXMotion = useMotionValue(0);
  const mouseYMotion = useMotionValue(0);
  
  // Framer Motion scroll animations - always called at top level
  const { scrollY, scrollYProgress } = useScroll({
    target: layoutRef,
    offset: ["start start", "end end"]
  });

  // Transform values for parallax effects - always called at top level
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 5]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);
  
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200]);
  const backgroundRotate = useTransform(mouseXMotion, [-1, 1], [-5, 5]);
  
  // Mouse transforms - always called at top level
  const rotateX = useTransform(mouseYMotion, [-1, 1], [2, -2]);
  const rotateY = useTransform(mouseXMotion, [-1, 1], [-2, 2]);
  const scaleTransform = useTransform(mouseYMotion, [-1, 1], [1.02, 0.98]);
  const blurTransform = useTransform(scrollY, [0, 500], [0, 5]);
  
  // Overlay opacity based on scroll - always called at top level
  const overlayOpacity = useTransform(scrollY, [0, 500], [0, 0.5]);
  
  // Header Y position based on scroll - always called at top level
  const headerY = useTransform(scrollY, [0, 100], [0, -100]);
  
  // Spring animations for smooth movement
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const smoothBackgroundY = useSpring(backgroundY, springConfig);
  const smoothBackgroundRotate = useSpring(backgroundRotate, springConfig);

  // Use external props if provided, otherwise use internal state
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined 
    ? externalMobileMenuOpen 
    : internalMobileMenuOpen;
    
  const handleMobileMenuToggle = useCallback(externalOnMobileMenuToggle || 
    (() => setInternalMobileMenuOpen(!isMobileMenuOpen)), 
    [isMobileMenuOpen, externalOnMobileMenuToggle]
  );

  // Close mobile menu when clicking outside (if internally controlled)
  const handleCloseMobileMenu = useCallback(() => {
    if (externalMobileMenuOpen === undefined) {
      setInternalMobileMenuOpen(false);
    }
  }, [externalMobileMenuOpen]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track window size for responsive animations
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

  // Mouse tracking for interactive effects - update motion values
  useEffect(() => {
    if (!enableMouseEffects || disableAnimations || prefersReducedMotion) return;
    
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
  }, [enableMouseEffects, disableAnimations, prefersReducedMotion, mouseXMotion, mouseYMotion]);

  // Measure header height for proper spacing
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
      
      // Hide/show header on scroll down/up
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setIsScrolled(scrolled);
      setLastScrollY(currentScrollY);
      
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
    handleScroll(); // initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollDirection]);

  // Page transition animations
  const pageVariants = {
    initial: { 
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6 * transitionSpeed,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      scale: 1.02,
      transition: {
        duration: 0.4 * transitionSpeed,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  // Content entrance animations
  const contentVariants = {
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
    }
  };

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

  // Determine main content padding based on header and homepage
  const mainStyle = (() => {
    if (!showHeader) return {};
    if (isHomePage) {
      return { paddingTop: 0 };
    }
    return { 
      paddingTop: `${headerHeight}px`,
      transition: 'padding-top 0.3s ease'
    };
  })();

  // Determine if animations should run
  const shouldAnimate = !disableAnimations && !prefersReducedMotion;

  // Create background style with motion values
  const backgroundStyle = {
    y: smoothBackgroundY,
    rotate: smoothBackgroundRotate,
    scale: scaleTransform,
    filter: `blur(${blurTransform}px)`,
  };

  // Create overlay background gradient - use .get() for static value
  const overlayBackground = `radial-gradient(circle at ${50 + mouseXMotion.get() * 20}% ${50 + mouseYMotion.get() * 20}%, rgba(59,130,246,0.05), transparent 70%)`;

  return (
    <motion.div 
      ref={layoutRef}
      className={`layout ${isScrolled ? 'scrolled' : ''} ${scrollDirection} ${className}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={shouldAnimate ? pageVariants : {}}
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        perspective: shouldAnimate ? 1000 : 'none',
        rotateX: shouldAnimate ? rotateX : 0,
        rotateY: shouldAnimate ? rotateY : 0,
      }}
    >
      {/* Dynamic Background with animations */}
      {shouldAnimate && (
        <DynamicBackground
          variant={backgroundVariant}
          intensity={backgroundIntensity}
          speed={backgroundSpeed}
          colors={backgroundColors}
          interactive={enableMouseEffects}
          style={backgroundStyle}
        />
      )}

      {/* Animated overlay that changes with scroll */}
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
          opacity: overlayOpacity // Using the pre-defined motion value
        }}
      />

      {/* Animated particles */}
      {shouldAnimate && (
        <div className="layout-particles">
          {[...Array(20)].map((_, i) => (
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

      {/* Header with animations */}
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
            y: headerY, // Using the pre-defined motion value
            opacity: headerOpacity,
            scale: headerScale,
            filter: `blur(${headerBlur}px)`,
            transition: 'transform 0.3s ease'
          }}
          animate={{
            y: isVisible ? 0 : -100
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
      
      {/* Mobile Menu Overlay with fade animation */}
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
      
      {/* Main content with entrance animations */}
      <motion.main 
        ref={mainContentRef}
        className={`main-content ${containerClass} ${isHomePage ? 'home-page' : ''}`}
        id="main-content"
        style={{
          ...mainStyle,
          position: 'relative',
          zIndex: 2,
          minHeight: 'calc(100vh - var(--header-height, 0px))'
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
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Scroll progress indicator */}
        {shouldAnimate && (
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
      
      {/* Footer with entrance animation */}
      {showFooter && (
        <motion.footer
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          {customFooter ? customFooter : <Footer />}
        </motion.footer>
      )}

      {/* Floating action button for back to top */}
      {shouldAnimate && (
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
            >
              ↑
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
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