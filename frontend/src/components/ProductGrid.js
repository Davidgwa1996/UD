import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AIPriceBadge from './AIPriceBadge';
import './ProductGrid.css';

const ProductGrid = ({ products = [], columns = 4 }) => {
  const { addToCart } = useCart();

  // ---------- Helper: truncate long strings ----------
  const truncateString = (str, maxLength = 22) => {
    if (!str) return str;
    return str.length > maxLength ? str.substring(0, maxLength) + '…' : str;
  };

  // ---------- No products fallback ----------
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  // ---------- Grid columns ----------
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  // ---------- Price formatting ----------
  const formatPrice = (price, currency = 'GBP') => {
    if (!price && price !== 0) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // ---------- AI price change formatting ----------
  const formatPriceChange = (change) => {
    if (change === undefined || change === null) return null;
    const isPositive = change > 0;
    return {
      symbol: isPositive ? '+' : '',
      value: change,
      formatted: `${isPositive ? '+' : ''}${change}%`,
      class: isPositive ? 'up' : 'down'
    };
  };

  // ---------- Non‑AI product badges (NEW, REFURBISHED, etc.) ----------
  const getProductBadge = (product) => {
    if (!product) return null;
    if (product.isNew) return { label: 'NEW', class: 'badge-new' };
    if (product.isRefurbished) return { label: 'REFURBISHED', class: 'badge-refurbished' };
    if (product.isAiPriced) return { label: 'AI-PRICED', class: 'badge-ai' };
    if (product.discount > 0) return { label: `-${product.discount}%`, class: 'badge-discount' };
    return null;
  };

  // ---------- Add to cart ----------
  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    
    const cartProduct = {
      id: product.id || product._id || Math.random().toString(36).substr(2, 9),
      name: product.name || 'Unnamed Product',
      price: product.price || 0,
      image: product.image || product.imageUrl || '/api/placeholder/300/300',
      category: product.category || 'Uncategorized',
      quantity: 1
    };
    
    addToCart(cartProduct);
    console.log(`${product.name || 'Product'} added to cart!`);
  };

  return (
    <div className="product-grid" style={gridStyle}>
      {products.map((product) => {
        if (!product) return null;
        
        const badge = getProductBadge(product);
        const priceChange = formatPriceChange(product.aiChange);
        
        // ---------- Only render AI badge if we have valid AI data ----------
        const shouldShowAIBadge = product.isAiPriced && product.aiChange !== undefined && product.aiChange !== null;
        
        // ---------- Safe values with fallbacks ----------
        const safeProduct = {
          name: product.name || 'Unnamed Product',
          category: product.category || 'Uncategorized',
          rating: product.rating || 4.5,
          reviews: product.reviews || 128,
          description: product.description || 'No description available',
          stock: product.stock ?? 29,
          price: product.price ?? 0,
          currency: product.currency || 'GBP',
          originalPrice: product.originalPrice,
          image: product.image || product.imageUrl || '/api/placeholder/300/300',
          aiLocation: truncateString(product.aiLocation || 'Liverpool', 22),
          aiUpdated: product.aiUpdated || '3m ago',
          aiChange: product.aiChange ?? -23.1
        };

        return (
          <div key={product.id || product._id || Math.random()} className="product-card">
            {/* ===== AI PRICE BADGE ===== */}
            {shouldShowAIBadge && (
              <AIPriceBadge 
                changePercent={safeProduct.aiChange}
                location={safeProduct.aiLocation}
                updatedAt={safeProduct.aiUpdated}
                trend={priceChange?.class || (safeProduct.aiChange > 0 ? 'up' : 'down')}
              />
            )}
            
            {/* ===== PRODUCT IMAGE ===== */}
            <Link to={`/product/${product.id || product._id || '1'}`} className="product-image-link">
              <div className="product-image">
                <img 
                  src={safeProduct.image} 
                  alt={safeProduct.name} 
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/300';
                    e.target.onerror = null;
                  }}
                />
                {badge && !shouldShowAIBadge && (
                  <div className={`product-badge ${badge.class}`}>
                    {badge.label}
                  </div>
                )}
              </div>
            </Link>

            {/* ===== PRODUCT INFO ===== */}
            <div className="product-info">
              <Link 
                to={`/product/${product.id || product._id || '1'}`} 
                className="product-name"
                title={safeProduct.name}
              >
                {safeProduct.name}
              </Link>
              
              <div className="product-category">
                {safeProduct.category}
              </div>
              
              <div className="product-rating">
                <span className="stars">⭐️⭐️⭐️⭐️⭐️</span>
                <span className="rating-value">{safeProduct.rating.toFixed(1)}/5</span>
                <span className="review-count">({safeProduct.reviews})</span>
              </div>

              <div className="product-description" title={safeProduct.description}>
                {safeProduct.description}
              </div>

              {/* ===== STOCK INFO ===== */}
              <div className="stock-info">
                <span className="stock-label">Market stock:</span>
                <span className="stock-value">{safeProduct.stock}</span>
                {shouldShowAIBadge && (
                  <span className="ai-updated-badge">AI updated</span>
                )}
              </div>

              {/* ===== PRICE SECTION ===== */}
              <div className="product-price-section">
                <div className="price-main">
                  <span className="current-price">
                    {formatPrice(safeProduct.price, safeProduct.currency)}
                  </span>
                  {safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price && (
                    <span className="original-price">
                      {formatPrice(safeProduct.originalPrice, safeProduct.currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* ===== ACTION BUTTONS – UPDATED ===== */}
              <div className="product-actions">
                <button 
                  className="btn btn-primary ai-best-price"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.stock || product.stock === 0}
                >
                  Buy Now - AI Best Price
                </button>
                
                <div className="secondary-actions">
                  <Link to={`/market-analysis/${product.id}`} className="btn btn-outline">
                    View Market Analysis
                  </Link>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock || product.stock === 0}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;