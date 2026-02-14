
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AIPriceBadge from './AIPriceBadge'; // ✅ import the badge

const CarouselRow = ({ title, items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) return null;

  const item = items[currentIndex];

  // Determine trend for the badge based on aiChange
  const trend = item.aiChange > 0 ? 'up' : item.aiChange < 0 ? 'down' : 'neutral';

  return (
    <div className="w-full mb-8">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white px-4 mb-4">{title}</h2>

      {/* Full‑width background container */}
      <div className="relative w-full bg-gradient-to-r from-slate-900 to-slate-800 py-8">
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center text-4xl hover:bg-black/80 focus:outline-none"
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Right Arrow */}
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center text-4xl hover:bg-black/80 focus:outline-none"
          aria-label="Next"
        >
          ›
        </button>

        {/* Card – spans full width with side padding */}
        <div className="px-4 sm:px-6 lg:px-8">
          <Link
            to={item.link}
            className="block w-full bg-white/5 rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Image – scales with container */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image';
                  }}
                />
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-xl text-slate-300 leading-relaxed mb-4">{item.specs}</p>

                {/* ✅ AI Price Badge – shown if aiChange exists */}
                {item.aiChange !== undefined && (
                  <AIPriceBadge
                    changePercent={item.aiChange}
                    location={item.aiLocation || 'Unknown'}
                    updatedAt={item.aiUpdated || '3m ago'}
                    trend={trend}
                  />
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
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

export default CarouselRow;