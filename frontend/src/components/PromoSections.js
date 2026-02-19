import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// Sample product data with enhanced fields
const rows = [
  {
    id: 'electronics',
    title: '⚡ Electronics Deals',
    icon: '💻',
    gradient: 'from-blue-500 to-cyan-500',
    items: [
      { id: 1, name: 'MacBook Pro 16"', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=150&fit=crop', desc: 'M3 Max, 36GB RAM', price: '£3,499', discount: 15, link: '/product/2' },
      { id: 2, name: 'iPhone 15 Pro', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=150&fit=crop', desc: 'Titanium, A17 Pro', price: '£1,099', discount: 10, link: '/product/3' },
      { id: 3, name: 'Sony A7RV', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=150&fit=crop', desc: '61MP, 8K video', price: '£3,899', discount: 5, link: '/product/14' },
      { id: 4, name: 'B&W Wedge', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&h=150&fit=crop', desc: 'Wireless hi-fi', price: '£899', discount: 20, link: '/product/7' },
      { id: 5, name: 'DJI Air 3', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=150&fit=crop', desc: 'Dual cameras', price: '£1,099', discount: 0, link: '/product/12' },
      { id: 6, name: 'PS5 Pro', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=150&fit=crop', desc: '4K/120fps', price: '£699', discount: 0, link: '/product/15' },
    ]
  },
  {
    id: 'classic-cars',
    title: '🚗 Classic & Electric Cars',
    icon: '🔋',
    gradient: 'from-purple-500 to-pink-500',
    items: [
      { id: 7, name: 'Tesla Model Y', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=150&fit=crop', desc: 'Dual Motor, 303mi', price: '£52,990', discount: 0, link: '/product/1' },
      { id: 8, name: 'Range Rover Sport', image: 'https://images.unsplash.com/photo-1593941707882-a5bba5338fe2?w=200&h=150&fit=crop', desc: 'PHEV, 542hp', price: '£78,500', discount: 8, link: '/product/6' },
      { id: 9, name: 'Jaguar I-PACE', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=200&h=150&fit=crop', desc: '395hp, 234mi', price: '£65,200', discount: 12, link: '/product/9' },
      { id: 10, name: 'Xiaomi SU7', image: 'https://images.unsplash.com/photo-1617868186608-87ae5c6f422c?w=200&h=150&fit=crop', desc: '495kW, 800km', price: '£42,000', discount: 0, link: '/product/10' },
      { id: 11, name: 'Toyota Century', image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=200&h=150&fit=crop', desc: 'V6 hybrid', price: '£98,000', discount: 5, link: '/product/13' },
    ]
  },
  {
    id: 'gaming',
    title: '🎮 Gaming & Accessories',
    icon: '🕹️',
    gradient: 'from-green-500 to-emerald-500',
    items: [
      { id: 12, name: 'RTX 4090', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=150&fit=crop', desc: '24GB GDDR6X', price: '£1,899', discount: 0, link: '/product/4' },
      { id: 13, name: 'Alienware m18', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&h=150&fit=crop', desc: 'i9-14900HX, RTX 4090', price: '£3,299', discount: 15, link: '/product/8' },
      { id: 14, name: 'PS5 Pro', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=150&fit=crop', desc: 'Disc Edition', price: '£699', discount: 0, link: '/product/15' },
    ]
  }
];

const PromoRow = ({ title, items, gradient, icon, index: rowIndex }) => {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [showArrows, setShowArrows] = useState({ left: false, right: false });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10]);

  // Spring animations
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });

  // Track mouse for 3D tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        setMouseX(x);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Check scroll position for arrows
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowArrows({
          left: scrollLeft > 20,
          right: scrollLeft < scrollWidth - clientWidth - 20
        });
        setScrollProgress((scrollLeft / (scrollWidth - clientWidth)) * 100 || 0);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      checkScroll();
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', checkScroll);
      }
    };
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateY: -30
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: i * 0.05 + rowIndex * 0.1
      }
    }),
    hover: {
      y: -10,
      scale: 1.05,
      rotateY: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="mb-12 relative"
      style={{ 
        y: springY,
        opacity,
        rotateX: springRotateX,
        rotateY: useTransform(() => mouseX * 3),
        perspective: 1000
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Row background with animated gradient */}
      <motion.div 
        className="absolute inset-0 rounded-3xl opacity-20"
        animate={{
          background: [
            `linear-gradient(45deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))`,
            `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))`,
            `linear-gradient(225deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))`
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Title with icon and animation */}
      <motion.h2 
        className="text-2xl font-bold text-white px-4 mb-4 flex items-center gap-2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: rowIndex * 0.1 }}
      >
        <motion.span
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl"
        >
          {icon}
        </motion.span>
        <motion.span
          className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          {title}
        </motion.span>
      </motion.h2>

      <div className="relative group">
        {/* Left arrow with animation */}
        <AnimatePresence>
          {showArrows.left && (
            <motion.button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:bg-black/70 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ◀
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow with animation */}
        <AnimatePresence>
          {showArrows.right && (
            <motion.button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:bg-black/70 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ▶
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable container */}
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-4 pb-6 scroll-smooth scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)'
          }}
          whileHover={{ cursor: 'grab' }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              className="flex-shrink-0"
              style={{
                rotateY: useTransform(() => mouseX * 3 * (index % 2 === 0 ? 1 : -1)),
                z: useTransform(() => hoveredItem === item.id ? 50 : 0)
              }}
            >
              <Link
                to={item.link}
                className="block w-56 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 relative overflow-hidden group/card"
              >
                {/* Card glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.2
                  }}
                />

                {/* Image container */}
                <div className="relative mb-3 overflow-hidden rounded-lg">
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => { 
                      e.target.src = 'https://placehold.co/200x150/1e293b/94a3b8?text=No+Image'; 
                    }}
                  />
                  
                  {/* Discount badge */}
                  {item.discount > 0 && (
                    <motion.div 
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      -{item.discount}%
                    </motion.div>
                  )}

                  {/* Quick view overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                    initial={false}
                  >
                    <motion.span
                      className="text-white text-sm font-medium"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      Quick View 👁️
                    </motion.span>
                  </motion.div>
                </div>

                {/* Content */}
                <motion.h3 
                  className="text-sm font-bold text-white mb-1 truncate group-hover/card:text-blue-400 transition-colors"
                  animate={{
                    color: hoveredItem === item.id ? '#60a5fa' : '#fff'
                  }}
                >
                  {item.name}
                </motion.h3>
                
                <motion.p 
                  className="text-xs text-slate-400 truncate mb-2"
                  animate={{
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                >
                  {item.desc}
                </motion.p>

                {/* Price with animation */}
                <div className="flex items-center justify-between">
                  <motion.span 
                    className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    animate={{
                      scale: hoveredItem === item.id ? 1.1 : 1
                    }}
                  >
                    {item.price}
                  </motion.span>
                  
                  {/* Add to cart indicator */}
                  <motion.div
                    className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(59,130,246,0.3)' }}
                  >
                    <span className="text-blue-400">➕</span>
                  </motion.div>
                </div>

                {/* Floating particles on hover */}
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        initial={{
                          x: '50%',
                          y: '50%',
                          scale: 0
                        }}
                        animate={{
                          x: `${50 + (Math.random() - 0.5) * 100}%`,
                          y: `${50 + (Math.random() - 0.5) * 100}%`,
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.2,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          style={{ width: `${scrollProgress}%` }}
          animate={{
            background: [
              'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
              'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)',
              'linear-gradient(90deg, #ec4899, #3b82f6, #8b5cf6)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Scroll indicator */}
        <motion.div 
          className="absolute -bottom-6 right-4 text-xs text-slate-500 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          {Math.round(scrollProgress)}% scrolled
        </motion.div>
      </div>
    </motion.div>
  );
};

const PromoSections = () => {
  return (
    <motion.div 
      className="py-8 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
            animate={{
              x: [null, Math.random() * 100 + '%'],
              y: [null, Math.random() * 100 + '%'],
              scale: [0, 2, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: Math.random() * 15 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {rows.map((row, index) => (
        <PromoRow 
          key={row.id} 
          title={row.title} 
          items={row.items} 
          gradient={row.gradient}
          icon={row.icon}
          index={index}
        />
      ))}
    </motion.div>
  );
};

export default PromoSections;