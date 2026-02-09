import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductGrid.css';

const ProductGrid = ({ products = [], columns = 4 }) => {
  const { addToCart } = useCart();

  // If products is null/undefined or empty, show message
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  const formatPrice = (price, currency = 'GBP') => {
    if (!price && price !== 0) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  const getProductBadge = (product) => {
    if (!product) return null;
    
    if (product.isNew) return { label: 'NEW', class: 'badge-new' };
    if (product.isRefurbished) return { label: 'REFURBISHED', class: 'badge-refurbished' };
    if (product.isAiPriced) return { label: 'AI-PRICED', class: 'badge-ai' };
    if (product.discount > 0) return { label: `-${product.discount}%`, class: 'badge-discount' };
    return null;
  };

  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    
    // Ensure product has required properties
    const cartProduct = {
      id: product.id || product._id || Math.random().toString(36).substr(2, 9),
      name: product.name || 'Unnamed Product',
      price: product.price || 0,
      image: product.image || product.imageUrl || '/api/placeholder/300/300',
      category: product.category || 'Uncategorized',
      quantity: 1
    };
    
    addToCart(cartProduct);
    
    // Optional: Show a confirmation
    alert(`${product.name || 'Product'} added to cart!`);
  };

  return (
    <div className="product-grid" style={gridStyle}>
      {products.map((product) => {
        if (!product) return null;
        
        const badge = getProductBadge(product);
        
        return (
          <div key={product.id || product._id || Math.random()} className="product-card">
            {/* Product Image */}
            <Link to={`/product/${product.id || product._id || '1'}`} className="product-image-link">
              <div className="product-image">
                <img 
                  src={product.image || product.imageUrl || '/api/placeholder/300/300'} 
                  alt={product.name || 'Product'} 
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/300';
                    e.target.onerror = null;
                  }}
                />
                {badge && (
                  <div className={`product-badge ${badge.class}`}>
                    {badge.label}
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="product-info">
              <Link to={`/product/${product.id || product._id || '1'}`} className="product-name">
                {product.name || 'Unnamed Product'}
              </Link>
              
              <div className="product-category">
                {product.category || 'Uncategorized'}
              </div>
              
              <div className="product-rating">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                <span className="rating-value">({(product.rating || 0).toFixed(1)}/5)</span>
              </div>

              <div className="product-description">
                {product.description || 'No description available'}
              </div>

              {/* Price Section */}
              <div className="product-price-section">
                <div className="price-main">
                  <span className="current-price">
                    {formatPrice(product.price || 0, product.currency)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">
                      {formatPrice(product.originalPrice, product.currency)}
                    </span>
                  )}
                </div>
                
                {product.aiPricing && (
                  <div className="ai-pricing">
                    <span className="ai-icon">🤖</span>
                    AI-calculated based on market demand
                  </div>
                )}
              </div>

              {/* Stock & Location */}
              <div className="product-meta">
                <span className="stock-status">
                  {(product.stock || 0) > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                </span>
                <span className="location">
                  📍 {product.location || 'UK Stock'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <button 
                  className="buy-now-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.stock || product.stock === 0}
                >
                  🛒 Add to Cart
                </button>
                
                <Link to={`/product/${product.id || product._id || '1'}`} className="view-details-btn">
                  View Details →
                </Link>
              </div>

              {/* AI Features (if applicable) */}
              {(product.aiFeatures || product.isAiPriced) && (
                <div className="ai-features">
                  <button className="ai-analysis-btn">
                    📊 View Market Analysis
                  </button>
                  <button className="price-alert-btn">
                    🔔 Price Alert
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;