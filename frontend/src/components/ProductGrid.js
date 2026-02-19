import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AIPriceBadge from './AIPriceBadge';
import './ProductGrid.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/1e293b/94a3b8?text=No+Image';

const ProductGrid = ({ products = [] }) => {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(null); // Track which product was just added

  const formatPrice = (price, currency = 'GBP') => {
    if (!price) return '£0.00';
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price);
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
    <div className="product-grid-custom">
      {products.map((product) => {
        const trend = product.aiChange > 0 ? 'up' : product.aiChange < 0 ? 'down' : 'neutral';
        const isAdded = addedToCart === product.id;

        return (
          <div key={product.id} className="product-card-custom">
            {/* Image */}
            <Link to={`/product/${product.id}`} className="product-image-link">
              <div className="product-image-custom">
                <img
                  src={product.image || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
              </div>
            </Link>

            {/* Product name */}
            <Link to={`/product/${product.id}`} className="product-name-custom">
              {product.name}
            </Link>

            <div className="product-category-custom">{product.category}</div>

            {/* Rating */}
            <div className="product-rating-custom">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span>{product.rating?.toFixed(1) || '4.5'}</span>
              <span>({product.reviews || 0})</span>
            </div>

            {/* Price and stock */}
            <div className="product-price-stock-custom">
              <span className="price-custom">{formatPrice(product.price)}</span>
              <span className="stock-custom">Stock: {product.stock || 0}</span>
            </div>

            {/* AI Price Badge (keep as is, it's part of product data) */}
            {product.aiChange && (
              <div className="ai-badge-wrapper">
                <AIPriceBadge
                  changePercent={product.aiChange}
                  location={product.aiLocation || 'Market'}
                  updatedAt={product.aiUpdated || 'Now'}
                  trend={trend}
                  size="small"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="product-buttons-custom">
              <Link to={`/market-analysis/${product.id}`} className="btn-custom analysis-btn">
                📊 Analysis
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!product.stock}
                className={`btn-custom add-btn ${!product.stock ? 'disabled' : ''}`}
              >
                {isAdded ? '✓ Added!' : '🛒 Add'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;