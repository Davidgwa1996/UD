import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIPriceBadge from './AIPriceBadge';

const PromoCarouselRow = ({ title, items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [timeSinceLastChange, setTimeSinceLastChange] = useState(0);

  // Auto-advance every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setTimeSinceLastChange(0);
    }, 3000); // 3 seconds = 3000ms

    return () => clearInterval(interval);
  }, [items.length]);

  // Track time since last change (for display)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceLastChange(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeSinceLastChange(0);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeSinceLastChange(0);
  };

  if (!items || items.length === 0) return null;

  const item = items[currentIndex];
  const trend = item.aiChange > 0 ? 'up' : item.aiChange < 0 ? 'down' : 'neutral';

  // Slide animations (faster for 3-second cycle)
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 30 }, // Faster spring
        opacity: { duration: 0.4 } // Faster fade
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 200, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  // Title animation (3-second cycle)
  const titleAnimation = {
    animate: {
      color: ['#ffffff', '#60a5fa', '#ffffff'],
      transition: {
        duration: 3, // 3 seconds
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      {/* Animated title - 3-second cycle */}
      <motion.h2 
        className="text-xl md:text-2xl font-bold text-white px-4 mb-3 md:mb-4"
        animate={titleAnimation.animate}
      >
        {title}
        <span className="ml-2 opacity-50">✨</span>
      </motion.h2>

      {/* Timer indicator (shows seconds until next change) */}
      <div className="text-xs text-slate-500 px-4 mb-2">
        Next promo in: {Math.max(0, 3 - timeSinceLastChange)}s
      </div>

      {/* Card container */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <Link to={item.link} className="block w-full">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-center">
                {/* Image */}
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover rounded-xl md:rounded-2xl shadow-xl"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 lg:mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed mb-3 md:mb-4">
                    {item.specs}
                  </p>

                  {/* AI Price Badge */}
                  {item.aiChange !== undefined && (
                    <div className="flex justify-center md:justify-start">
                      <AIPriceBadge
                        changePercent={item.aiChange}
                        location={item.aiLocation || 'Unknown'}
                        updatedAt={item.aiUpdated || '3m ago'}
                        trend={trend}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={prev}
          className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
                setTimeSinceLastChange(0);
              }}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${
                i === currentIndex ? 'bg-blue-500' : 'bg-slate-600'
              }`}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCarouselRow;