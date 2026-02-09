import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Shield, Truck, CreditCard, Lock, Globe, X } from 'lucide-react';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const { 
    items,  // Changed from 'cart' to 'items'
    cartTotal, 
    cartCount,  // Changed from 'getCartCount()' to 'cartCount'
    removeFromCart, 
    updateQuantity, 
    clearCart,
    currency
  } = useCart();

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate derived values
  const shippingAmount = cartTotal > 1000 ? 0 : 49.99;
  const taxAmount = cartTotal * 0.08;
  const grandTotal = cartTotal + taxAmount + shippingAmount;
  const isCartEmpty = items.length === 0;

  const getCurrencySymbol = () => {
    return currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setShowPaymentOptions(true);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handlePaymentSelection = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
  };

  const handleConfirmPayment = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    
    alert(`Payment with ${selectedPayment.toUpperCase()} confirmed! Thank you for your purchase.`);
    clearCart();
    navigate('/checkout-success');
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 'paypal', name: 'PayPal', icon: '🔵', description: 'Secure PayPal payment' },
    { id: 'apple', name: 'Apple Pay', icon: '', description: 'Apple Pay & Apple Card' },
    { id: 'google', name: 'Google Pay', icon: 'G', description: 'Google Wallet' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', description: 'BTC, ETH, USDC' }
  ];

  const MobileMenu = () => (
    <>
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
           onClick={() => setIsMobileMenuOpen(false)} />
      <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h2 style={{color: '#00e5ff'}}>Cart Menu</h2>
          <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mobile-nav-items">
          <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="mobile-nav-item">
            🏠 Home
          </button>
          <button onClick={() => { navigate('/products'); setIsMobileMenuOpen(false); }} className="mobile-nav-item">
            🛍️ All Products
          </button>
          <button onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }} className="mobile-nav-item">
            🛒 View Cart
          </button>
          <button onClick={() => { navigate('/checkout'); setIsMobileMenuOpen(false); }} className="mobile-nav-item">
            💳 Checkout
          </button>
          <button onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }} className="mobile-nav-item">
            📞 Contact
          </button>
          <button onClick={clearCart} className="mobile-nav-item text-red-500">
            🗑️ Clear Cart
          </button>
        </div>
      </div>
    </>
  );

  if (isCartEmpty) {
    return (
      <div className="cart-page">
        <MobileMenu />
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          ☰ Menu
        </button>

        <div className="cart-container empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag className="h-20 w-20" />
          </div>
          <h1 className="empty-cart-title">Your cart is empty</h1>
          <p className="empty-cart-description">
            Add some products from our global marketplace
          </p>
          <div className="empty-cart-actions">
            <button 
              onClick={handleContinueShopping}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="btn btn-secondary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <MobileMenu />
      
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        ☰ Menu
      </button>

      <header className="cart-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Globe className="h-6 w-6 text-blue-500" />
              <span>UniDigital Cart</span>
            </div>
            <button 
              className="cart-icon-header"
              onClick={() => navigate('/cart')}
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="cart-main">
        <div className="container">
          <div className="cart-content">
            <div className="cart-header-section">
              <h1 className="cart-title">Shopping Cart</h1>
              <div className="cart-info">
                <span className="cart-count-badge">{cartCount} items</span>
                <button 
                  onClick={clearCart}
                  className="clear-cart-btn"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="cart-layout">
              <div className="cart-items-section">
                <div className="cart-items-container">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="item-icon">{item.icon || '📦'}</div>
                        )}
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-header">
                          <h3 className="cart-item-name">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="remove-item-btn"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="cart-item-meta">
                          <span className="cart-item-category">{item.category}</span>
                          <span className="cart-item-market">{item.market || 'Global'}</span>
                        </div>
                        
                        <div className="cart-item-price">
                          {getCurrencySymbol()}{item.price.toLocaleString()}
                        </div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-control">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="quantity-btn"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="quantity-btn"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="cart-item-total">
                            {getCurrencySymbol()}{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="continue-shopping">
                  <button 
                    onClick={handleContinueShopping}
                    className="back-to-shopping-btn"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </button>
                </div>
              </div>

              <div className="order-summary-section">
                <div className="order-summary-card">
                  <h2 className="order-summary-title">Order Summary</h2>
                  
                  <div className="order-breakdown">
                    <div className="breakdown-row">
                      <span>Subtotal</span>
                      <span>{getCurrencySymbol()}{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Shipping</span>
                      <span>{shippingAmount === 0 ? 'FREE' : `${getCurrencySymbol()}${shippingAmount.toFixed(2)}`}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Tax (8%)</span>
                      <span>{getCurrencySymbol()}{taxAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="breakdown-total">
                      <span>Total</span>
                      <span className="total-amount">
                        {getCurrencySymbol()}{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>

                  {!showPaymentOptions ? (
                    <>
                      <button 
                        onClick={handleCheckout}
                        className="checkout-btn"
                      >
                        <Lock className="h-5 w-5" />
                        Proceed to Payment
                      </button>
                      
                      <div className="payment-security">
                        <div className="security-item">
                          <Shield className="h-5 w-5 text-green-500" />
                          <span>Secure 256-bit SSL encryption</span>
                        </div>
                        <div className="security-item">
                          <Truck className="h-5 w-5 text-blue-500" />
                          <span>Global shipping available</span>
                        </div>
                        <div className="security-item">
                          <CreditCard className="h-5 w-5 text-purple-500" />
                          <span>Multiple payment methods</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="payment-options-container">
                      <h3 className="payment-options-title">Select Payment Method</h3>
                      <p className="payment-options-subtitle">
                        Choose your preferred payment option
                      </p>
                      
                      <div className="payment-methods-grid">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handlePaymentSelection(method.id)}
                            className={`payment-method-btn ${selectedPayment === method.id ? 'selected' : ''}`}
                          >
                            <div className="payment-method-icon">{method.icon}</div>
                            <div className="payment-method-info">
                              <div className="payment-method-name">{method.name}</div>
                              <div className="payment-method-desc">{method.description}</div>
                            </div>
                            {selectedPayment === method.id && (
                              <div className="payment-method-check">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="payment-actions">
                        <button 
                          onClick={() => setShowPaymentOptions(false)}
                          className="btn btn-secondary"
                        >
                          ← Back to Cart
                        </button>
                        <button 
                          onClick={handleConfirmPayment}
                          className="btn btn-primary"
                          disabled={!selectedPayment}
                        >
                          Confirm Payment →
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="support-section">
                    <h4 className="support-title">Need help?</h4>
                    <div className="support-links">
                      <button onClick={() => navigate('/contact')}>
                        Contact Support
                      </button>
                      <button onClick={() => navigate('/global-payments')}>
                        Global Payment Options
                      </button>
                      <button onClick={() => navigate('/shipping')}>
                        Shipping Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CartPage;