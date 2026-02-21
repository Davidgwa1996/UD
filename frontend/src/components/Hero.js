import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

function Hero() {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const rotatingWords = ['Premium', 'Luxury', 'Quality', 'Certified', 'Elite', 'Authentic'];

  // Check device type and preferences
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    
    const checkMotionPreference = () => {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkDevice();
    checkMotionPreference();
    
    window.addEventListener('resize', checkDevice);
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkMotionPreference);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkMotionPreference);
    };
  }, []);

  // Parallax scroll effect - disabled on mobile for performance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 50 : 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1.1]);

  // Spring animations - disabled if reduced motion preferred
  const springY = !isReducedMotion ? useSpring(y, { stiffness: 100, damping: 30 }) : y;
  const springScale = !isReducedMotion ? useSpring(scale, { stiffness: 100, damping: 30 }) : scale;

  // Track mouse for 3D effects - disabled on mobile/touch devices
  useEffect(() => {
    if (isMobile || isReducedMotion) return;
    
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, isReducedMotion]);

  // Rotating words effect - slower on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, isMobile ? 4000 : 3000);
    return () => clearInterval(interval);
  }, [isMobile]);

  // Memoized particles for performance
  const particles = useMemo(() => 
    Array.from({ length: isMobile ? 15 : isTablet ? 30 : 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 2 : 4) + 1,
      duration: Math.random() * (isMobile ? 30 : 20) + 15,
      delay: Math.random() * 5,
      xMove: (Math.random() * 100 - 50) * (isMobile ? 0.5 : 1),
      yMove: (Math.random() * 100 - 50) * (isMobile ? 0.5 : 1)
    })), [isMobile, isTablet]);

  // Floating shapes positions
  const shapes = useMemo(() => [
    { top: '-20%', right: '-10%', width: '40vw', height: '40vw', maxWidth: 300, maxHeight: 300, from: 'from-yellow-400', to: 'to-orange-500', duration: 20 },
    { bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', maxWidth: 400, maxHeight: 400, from: 'from-blue-400', to: 'to-purple-500', duration: 25 },
    { top: '30%', left: '5%', width: '20vw', height: '20vw', maxWidth: 150, maxHeight: 150, from: 'from-green-400', to: 'to-blue-500', duration: 15 },
    { bottom: '20%', right: '5%', width: '25vw', height: '25vw', maxWidth: 200, maxHeight: 200, from: 'from-pink-400', to: 'to-red-500', duration: 18 }
  ], []);

  // Handle touch for mobile
  const handleTouchMove = useCallback((e) => {
    if (!isMobile) return;
    // Optional: Add subtle parallax on touch
  }, [isMobile]);

  return (
    <motion.section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        y: springY,
        scale: springScale,
        opacity,
        rotateX: !isMobile && !isReducedMotion ? mousePosition.y * 5 : 0,
        rotateY: !isMobile && !isReducedMotion ? mousePosition.x * 5 : 0,
        perspective: !isMobile && !isReducedMotion ? 1000 : 'none'
      }}
      onTouchMove={handleTouchMove}
    >
      {/* Animated gradient background - simplified on mobile */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: isMobile ? [
            'radial-gradient(circle at 30% 40%, #3b82f6, #1e3a8a, #0f172a)',
            'radial-gradient(circle at 70% 60%, #8b5cf6, #1e3a8a, #0f172a)'
          ] : [
            'radial-gradient(circle at 20% 30%, #3b82f6, #1e3a8a, #0f172a)',
            'radial-gradient(circle at 80% 70%, #8b5cf6, #1e3a8a, #0f172a)',
            'radial-gradient(circle at 20% 30%, #3b82f6, #1e3a8a, #0f172a)'
          ]
        }}
        transition={{ 
          duration: isMobile ? 8 : 10, 
          repeat: Infinity, 
          ease: "linear",
          ...(isReducedMotion && { duration: 0 })
        }}
      />

      {/* Animated mesh gradient overlay - hidden on mobile for performance */}
      {!isMobile && !isReducedMotion && (
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(125deg, #3b82f6 0%, transparent 50%, #8b5cf6 100%)',
              'linear-gradient(215deg, #8b5cf6 0%, transparent 50%, #3b82f6 100%)',
              'linear-gradient(345deg, #3b82f6 0%, transparent 50%, #8b5cf6 100%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Floating particles - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white/10 rounded-full backdrop-blur-sm"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={!isReducedMotion ? {
              x: [0, particle.xMove, 0],
              y: [0, particle.yMove, 0],
              scale: [1, Math.random() * 1.5 + 1, 1],
              opacity: [0.1, 0.2, 0.1],
              backgroundColor: [
                'rgba(59,130,246,0.1)',
                'rgba(139,92,246,0.1)',
                'rgba(59,130,246,0.1)'
              ]
            } : {}}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Animated glowing orbs - positioned responsively */}
      <motion.div 
        className="absolute top-10 sm:top-20 left-5 sm:left-20 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={!isReducedMotion ? {
          x: isMobile ? [0, 30, 0] : [0, 100, 0],
          y: isMobile ? [0, -20, 0] : [0, -50, 0],
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        } : {}}
        transition={{ duration: isMobile ? 15 : 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-56 sm:w-80 md:w-[30rem] h-56 sm:h-80 md:h-[30rem] bg-purple-500/20 rounded-full blur-3xl"
        animate={!isReducedMotion ? {
          x: isMobile ? [0, -30, 0] : [0, -100, 0],
          y: isMobile ? [0, 20, 0] : [0, 50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        } : {}}
        transition={{ duration: isMobile ? 18 : 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated badge - responsive sizing */}
          <motion.div 
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-xl rounded-full mb-6 sm:mb-8 border border-white/20"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={!isMobile ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
          >
            <motion.span 
              className="w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full mr-2 sm:mr-3"
              animate={!isReducedMotion ? {
                scale: [1, 1.5, 1],
                boxShadow: [
                  '0 0 0px rgba(74,222,128,0)',
                  '0 0 20px rgba(74,222,128,0.5)',
                  '0 0 0px rgba(74,222,128,0)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs sm:text-sm font-medium text-white/90">
              ✦ UK's #1 Premium Marketplace ✦
            </span>
          </motion.div>

          {/* Main heading with rotating words - responsive font sizes */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient block sm:inline">
              Drive & 
            </span>
            <br className="sm:hidden" />
            <span className="relative inline-block mt-2 sm:mt-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: isMobile ? 20 : 50, rotateX: isMobile ? 0 : -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: isMobile ? -20 : -50, rotateX: isMobile ? 0 : 90 }}
                  transition={{ duration: 0.5 }}
                >
                  {rotatingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-white"> Tech</span>
            </span>
          </motion.h1>

          {/* Animated description - responsive text */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              animate={!isReducedMotion ? {
                background: [
                  'linear-gradient(90deg, #fff, #94a3b8, #fff)',
                  'linear-gradient(90deg, #94a3b8, #fff, #94a3b8)'
                ],
                backgroundSize: '200% 100%',
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              } : {}}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {isMobile 
                ? "UK's fastest-growing marketplace for premium cars, electronics & accessories."
                : "UK's fastest-growing marketplace for premium cars, electronics, gadgets, and automotive accessories. New, used, and refurbished items with verified sellers."
              }
            </motion.span>
          </motion.p>

          {/* CTA Buttons - stacked on mobile, row on larger screens */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg overflow-hidden w-full sm:w-auto"
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => !isMobile && setIsHovering(true)}
              onHoverEnd={() => !isMobile && setIsHovering(false)}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ x: '-100%' }}
                animate={{ x: isHovering && !isMobile ? 0 : '-100%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                Browse All Products
                <motion.svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: isHovering && !isMobile ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </motion.svg>
              </span>
            </motion.button>

            <motion.button 
              className="group relative bg-white/10 backdrop-blur-xl text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg border-2 border-white/30 overflow-hidden w-full sm:w-auto"
              whileHover={!isMobile ? { scale: 1.05, borderColor: 'rgba(255,255,255,0.5)' } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={!isMobile ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Sell Your Item</span>
            </motion.button>
          </motion.div>

          {/* Stats with counters - responsive grid */}
          <motion.div 
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { value: 10000, label: 'Active Listings', suffix: '+' },
              { value: 4.8, label: 'Trust Rating', suffix: '★' },
              { value: 24, label: 'Fast Delivery', suffix: 'h' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center group cursor-pointer"
                whileHover={!isMobile ? { y: -5 } : {}}
              >
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2"
                  animate={!isReducedMotion ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ duration: 2, delay: index * 0.3, repeat: Infinity }}
                >
                  <Counter value={stat.value} suffix={stat.suffix} duration={isMobile ? 1500 : 2000} />
                </motion.div>
                <div className="text-gray-300 text-sm sm:text-base md:text-lg relative">
                  {stat.label}
                  {!isMobile && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating shapes - responsive positioning */}
          {!isReducedMotion && shapes.map((shape, index) => (
            <motion.div 
              key={index}
              className={`absolute ${shape.top ? 'top' : ''}${shape.bottom ? 'bottom' : ''} ${shape.left ? 'left' : ''}${shape.right ? 'right' : ''} bg-gradient-to-br ${shape.from} ${shape.to} rounded-3xl opacity-20 blur-2xl hidden md:block`}
              style={{
                top: shape.top,
                bottom: shape.bottom,
                left: shape.left,
                right: shape.right,
                width: shape.width,
                height: shape.height,
                maxWidth: shape.maxWidth,
                maxHeight: shape.maxHeight
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: shape.duration, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator - hide on touch devices or when reduced motion preferred */}
      {!isMobile && !isReducedMotion && (
        <motion.div 
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 sm:w-6 h-8 sm:h-10 rounded-full border-2 border-white/30 flex justify-center">
            <motion.div 
              className="w-1 h-2 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}

      {/* Mobile swipe indicator */}
      {isMobile && (
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>←</span>
          <span>Swipe</span>
          <span>→</span>
        </motion.div>
      )}
    </motion.section>
  );
}

// Enhanced Counter component with performance optimizations
const Counter = ({ value, suffix, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration, isVisible]);

  return (
    <span ref={counterRef}>
      {count.toFixed(value % 1 === 0 ? 0 : 1)}{suffix}
    </span>
  );
};

export default Hero;