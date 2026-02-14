import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const FullWidthScrollRow = ({ title, items }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400; // pixels per click
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mb-8 relative">
      {/* Title – optional, you can keep or remove */}
      {title && <h2 className="text-xl font-bold text-white px-4 mb-3">{title}</h2>}
      
      {/* Scrollable container – full width, no side padding */}
      <div className="relative group">
        {/* Left arrow – appears on hover */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90 focus:outline-none"
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90 focus:outline-none"
          aria-label="Scroll right"
        >
          ›
        </button>

        {/* The scrollable row – full width, horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex-shrink-0 w-64 bg-white/5 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
            >
              <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
              <div className="p-3">
                <h3 className="font-bold text-white text-sm truncate">{item.title}</h3>
                <p className="text-xs text-slate-400 truncate">{item.specs}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullWidthScrollRow;