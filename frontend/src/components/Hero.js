import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

function Hero() {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const rotatingWords = ['Premium', 'Luxury', 'Quality', 'Certified', 'Elite'];

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.2]);

  // Spring animations
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  // Track mouse for 3D effects
  useEffect(() => {
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
  }, []);

  // Rotating words effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <motion.section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        y: springY,
        scale: springScale,
        opacity,
        rotateX: useTransform(() => mousePosition.y * 5),
        rotateY: useTransform(() => mousePosition.x * 5),
        perspective: 1000
      }}
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, #3b82f6, #1e3a8a, #0f172a)',
            'radial-gradient(circle at 80% 70%, #8b5cf6, #1e3a8a, #0f172a)',
            'radial-gradient(circle at 20% 30%, #3b82f6, #1e3a8a, #0f172a)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Animated mesh gradient overlay */}
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

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
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
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, Math.random() * 2 + 1, 1],
              opacity: [0.1, 0.3, 0.1],
              backgroundColor: [
                'rgba(59,130,246,0.1)',
                'rgba(139,92,246,0.1)',
                'rgba(59,130,246,0.1)'
              ]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Animated glowing orbs */}
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div 
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full mb-8 border border-white/20"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <motion.span 
              className="w-3 h-3 bg-green-400 rounded-full mr-3"
              animate={{
                scale: [1, 1.5, 1],
                boxShadow: [
                  '0 0 0px rgba(74,222,128,0)',
                  '0 0 20px rgba(74,222,128,0.5)',
                  '0 0 0px rgba(74,222,128,0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-white/90">
              ✦ UK's #1 Premium Marketplace ✦
            </span>
          </motion.div>

          {/* Main heading with rotating words */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
              Drive & 
            </span>
            <br />
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -50, rotateX: 90 }}
                  transition={{ duration: 0.5 }}
                >
                  {rotatingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-white"> Tech</span>
            </span>
          </motion.h1>

          {/* Animated description */}
          <motion.p 
            className="text-xl md:text-2xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              animate={{
                background: [
                  'linear-gradient(90deg, #fff, #94a3b8, #fff)',
                  'linear-gradient(90deg, #94a3b8, #fff, #94a3b8)'
                ],
                backgroundSize: '200% 100%',
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              UK's fastest-growing marketplace for premium cars, electronics, gadgets,
              and automotive accessories. New, used, and refurbished items with verified sellers.
            </motion.span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button 
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ x: '-100%' }}
                animate={{ x: isHovering ? 0 : '-100%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                Browse All Products
                <motion.svg 
                  className="w-6 h-6 ml-2"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: isHovering ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </motion.svg>
              </span>
            </motion.button>

            <motion.button 
              className="group relative bg-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-xl font-bold text-lg border-2 border-white/30 overflow-hidden"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Sell Your Item</span>
            </motion.button>
          </motion.div>

          {/* Stats with counters */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
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
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, delay: index * 0.3, repeat: Infinity }}
                >
                  <Counter value={stat.value} suffix={stat.suffix} />
                </motion.div>
                <div className="text-gray-300 text-lg relative">
                  {stat.label}
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating shapes */}
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl opacity-20 blur-2xl"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl"
            animate={{
              rotate: [360, 180, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
          <motion.div 
            className="w-1 h-2 bg-white rounded-full mt-2"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}

// Counter component for stats
const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
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
  }, [value]);

  return (
    <span>
      {count.toFixed(value % 1 === 0 ? 0 : 1)}{suffix}
    </span>
  );
};

export default Hero;