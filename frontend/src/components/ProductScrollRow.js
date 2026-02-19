import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductScrollRow = ({ title, items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="w-full mb-8 relative">
      {title && (
        <h2 className="text-xl font-bold text-white px-4 mb-3">
          {title}
        </h2>
      )}
      
      <div className="relative">
        {/* Single Item Display */}
        <div className="px-4">
          <Link 
            to={currentItem.link} 
            className="block w-full"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Image - Larger for single item view */}
              <div className="w-full md:w-1/2">
                <img 
                  src={currentItem.image} 
                  alt={currentItem.title} 
                  className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image';
                  }}
                />
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {currentItem.title}
                </h3>
                <p className="text-lg text-slate-300 mb-4">
                  {currentItem.specs}
                </p>
                {currentItem.price && (
                  <p className="text-2xl font-bold text-blue-400 mb-4">
                    ${currentItem.price.toLocaleString()}
                  </p>
                )}
                <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center mt-6 px-4">
          <button
            onClick={prev}
            className="bg-slate-800 hover:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl transition-colors"
            aria-label="Previous item"
          >
            ‹
          </button>
          
          {/* Position indicator */}
          <span className="text-slate-400 text-sm">
            {currentIndex + 1} / {items.length}
          </span>
          
          <button
            onClick={next}
            className="bg-slate-800 hover:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl transition-colors"
            aria-label="Next item"
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
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-blue-500' : 'bg-slate-600'
                }`}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductScrollRow;