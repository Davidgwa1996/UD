import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PromoScrollRow = ({ title, items }) => {
  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState({ left: false, right: false });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

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
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + (direction === 'left' ? -amount : amount),
        behavior: 'smooth'
      });
    }
  };

  // Animation variants
  const titleVariants = {
    animate: {
      background: [
        "linear-gradient(90deg, #fff, #60a5fa, #fff)",
        "linear-gradient(90deg, #60a5fa, #fff, #60a5fa)"
      ],
      backgroundSize: "200% 100%",
      backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      transition: { duration: 5, repeat: Infinity }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.05, type: "spring", stiffness: 100 }
    }),
    hover: { y: -8, scale: 1.02, boxShadow: "0 20px 40px -12px rgba(59,130,246,0.4)" }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full mb-8 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Animated title */}
      {title && (
        <motion.h2
          className="text-xl font-bold text-white px-4 mb-3 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.span variants={titleVariants} animate="animate">
            {title}
          </motion.span>
          <motion.span
            className="ml-2 inline-block"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✦
          </motion.span>
        </motion.h2>
      )}

      <div className="relative group">
        <AnimatePresence>
          {showArrows.left && (
            <motion.button
              key="left"
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center text-4xl border border-white/10"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ‹
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showArrows.right && (
            <motion.button
              key="right"
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center text-4xl border border-white/10"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ›
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-6 px-4 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onHoverStart={() => setHoveredId(item.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="flex-shrink-0"
            >
              <Link
                to={item.link}
                className="block w-72 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
              >
                <div className="relative overflow-hidden h-44">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => e.target.src = 'https://placehold.co/400x300/1e293b/94a3b8?text=No+Image'}
                  />
                  {item.price && (
                    <motion.div
                      className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-sm font-bold"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      ${item.price}
                    </motion.div>
                  )}
                  {item.aiChange && (
                    <motion.div
                      className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${
                        item.aiChange > 0 ? 'bg-green-500/70' : 'bg-red-500/70'
                      }`}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.aiChange > 0 ? '↗' : '↘'} {Math.abs(item.aiChange)}%
                    </motion.div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white text-base mb-1 truncate">{item.title}</h3>
                  <p className="text-sm text-slate-400 truncate">{item.specs}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          style={{ width: `${scrollProgress}%` }}
          animate={{
            background: [
              'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
              'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default PromoScrollRow;