import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AIPriceBadge from './AIPriceBadge';
import './ProductGrid.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/1e293b/94a3b8?text=No+Image';

const ProductGrid = ({ products = [] }) => {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const touchStartRef = useRef(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if grid is scrollable and setup intersection observer
  useEffect(() => {
    if (!isMobile || !gridRef.current || !products.length) return;

    const checkOverflow = () => {
      if (gridRef.current) {
        const hasOverflow = gridRef.current.scrollWidth > gridRef.current.clientWidth;
        setShowScrollHint(hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    // Setup intersection observer for active dot indicator
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      { threshold: 0.6, root: gridRef.current }
    );

    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => {
      window.removeEventListener('resize', checkOverflow);
      observer.disconnect();
    };
  }, [isMobile, products]);

  // Track scroll position for progress bar
  const handleScroll = useCallback(() => {
    if (!gridRef.current || !isMobile) return;

    const { scrollLeft, scrollWidth, clientWidth } = gridRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(progress);
  }, [isMobile]);

  // Mouse/Touch drag to scroll
  const handleMouseDown = (e) => {
    if (!isMobile || !gridRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - gridRef.current.offsetLeft);
    setScrollLeft(gridRef.current.scrollLeft);
    gridRef.current.style.cursor = 'grabbing';
    gridRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !gridRef.current || !isMobile) return;
    
    e.preventDefault();
    const x = e.pageX - gridRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    gridRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!isMobile) return;
    
    setIsDragging(false);
    if (gridRef.current) {
      gridRef.current.style.cursor = 'grab';
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    if (!isMobile || !gridRef.current) return;
    touchStartRef.current = {
      x: e.touches[0].pageX,
      scrollLeft: gridRef.current.scrollLeft
    };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || !gridRef.current || !isMobile) return;
    
    const x = e.touches[0].pageX;
    const walk = (touchStartRef.current.x - x) * 2;
    gridRef.current.scrollLeft = touchStartRef.current.scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Scroll to specific card when dot is clicked
  const scrollToCard = (index) => {
    if (!gridRef.current || !cardRefs.current[index]) return;
    
    cardRefs.current[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  };

  const formatPrice = (price, currency = 'GBP') => {
    if (!price) return '£0.00';
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(price);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || PLACEHOLDER_IMAGE,
      quantity: 1
    });
    setAddedToCart(product.id);
    
    // Show success animation
    setTimeout(() => setAddedToCart(null), 2000);
  };

  if (!products || products.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="product-grid-wrapper">
      {/* Scroll Progress Bar (only on mobile) */}
      {isMobile && showScrollHint && (
        <div className="scroll-progress-container">
          <div 
            className="scroll-progress-bar" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Main Grid */}
      <div
        ref={gridRef}
        className={`product-grid-custom ${
          isMobile ? 'mobile-grid' : ''
        } ${isSmallMobile ? 'small-mobile-grid' : ''} ${
          isDragging ? 'dragging' : ''
        }`}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isMobile ? 'grab' : 'default' }}
      >
        {products.map((product, index) => {
          const trend = product.aiChange > 0 ? 'up' : product.aiChange < 0 ? 'down' : 'neutral';
          const isAdded = addedToCart === product.id;
          const stockStatus = product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'out';

          return (
            <div
              key={product.id}
              ref={el => cardRefs.current[index] = el}
              className={`product-card-custom ${stockStatus === 'low' ? 'low-stock' : ''} ${
                stockStatus === 'out' ? 'out-of-stock' : ''
              }`}
              data-index={index}
            >
              {/* Image with optional sale badge */}
              <Link to={`/product/${product.id}`} className="product-image-link">
                <div className="product-image-custom">
                  <img
                    src={product.image || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  {product.sale && (
                    <span className="sale-badge">SALE</span>
                  )}
                </div>
              </Link>

              {/* Product name */}
              <Link to={`/product/${product.id}`} className="product-name-custom">
                {product.name}
              </Link>

              <div className="product-category-custom">{product.category}</div>

              {/* Rating with conditional rendering */}
              <div className="product-rating-custom">
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating || 4.5))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
                </span>
                <span className="rating-value">{product.rating?.toFixed(1) || '4.5'}</span>
                <span className="review-count">({product.reviews || 0})</span>
              </div>

              {/* Price and stock with status colors */}
              <div className="product-price-stock-custom">
                <span className="price-custom">
                  {product.originalPrice && (
                    <span className="original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {formatPrice(product.price)}
                </span>
                <span className={`stock-custom stock-${stockStatus}`}>
                  {stockStatus === 'out' ? 'Out of Stock' : 
                   stockStatus === 'low' ? `Only ${product.stock} left` : 
                   `Stock: ${product.stock}`}
                </span>
              </div>

              {/* AI Price Badge */}
              {product.aiChange && (
                <div className="ai-badge-wrapper">
                  <AIPriceBadge
                    changePercent={product.aiChange}
                    location={product.aiLocation || 'Market'}
                    updatedAt={product.aiUpdated || 'Now'}
                    trend={trend}
                    size={isSmallMobile ? 'small' : 'medium'}
                  />
                </div>
              )}

              {/* Buttons with improved states */}
              <div className="product-buttons-custom">
                <Link 
                  to={`/market-analysis/${product.id}`} 
                  className="btn-custom analysis-btn"
                  aria-label={`View market analysis for ${product.name}`}
                >
                  <span className="btn-icon">📊</span>
                  <span className="btn-text">Analysis</span>
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.stock}
                  className={`btn-custom add-btn ${!product.stock ? 'disabled' : ''} ${
                    isAdded ? 'added' : ''
                  }`}
                  aria-label={isAdded ? 'Added to cart' : `Add ${product.name} to cart`}
                >
                  <span className="btn-icon">{isAdded ? '✓' : '🛒'}</span>
                  <span className="btn-text">{isAdded ? 'Added!' : 'Add'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Indicators (only on mobile) */}
      {isMobile && showScrollHint && (
        <div className="mobile-scroll-indicator">
          <div className="swipe-dots">
            {products.map((_, index) => (
              <button
                key={index}
                className={`swipe-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => scrollToCard(index)}
                aria-label={`Scroll to product ${index + 1}`}
              />
            ))}
          </div>
          <div className="swipe-hint">
            <span className="swipe-arrow">←</span>
            <span className="swipe-text">Swipe to see more</span>
            <span className="swipe-arrow">→</span>
          </div>
        </div>
      )}

      {/* Scroll to Top Button (appears when scrolled far) */}
      {isMobile && scrollProgress > 30 && (
        <button
          className="scroll-top-btn"
          onClick={() => gridRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
          aria-label="Scroll to beginning"
        >
          ⬅
        </button>
      )}
    </div>
  );
};

export default ProductGrid;