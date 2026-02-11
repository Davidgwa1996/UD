import React, { useState, useEffect } from 'react';
import './GlobalPaymentMethods.css';

const GlobalPaymentMethods = () => {
  const [userRegion, setUserRegion] = useState('global');
  const [activeTab, setActiveTab] = useState('all');

  // Simulate detecting user region (in production, use IP detection API)
  useEffect(() => {
    // This would be replaced with actual IP detection
    const detectedRegion = 'global'; // Default
    setUserRegion(detectedRegion);
  }, []);

  // Payment methods data organized by region
  const paymentMethods = {
    all: [
      { id: 'visa', name: 'Visa', icon: '💳', type: 'card', regions: ['global'], support: '2D/3D' },
      { id: 'mastercard', name: 'Mastercard', icon: '💳', type: 'card', regions: ['global'], support: '2D/3D' },
      { id: 'amex', name: 'American Express', icon: '💳', type: 'card', regions: ['global'], support: '2D/3D' },
      { id: 'discover', name: 'Discover', icon: '💳', type: 'card', regions: ['us'], support: '2D/3D' },
      { id: 'jcb', name: 'JCB', icon: '💳', type: 'card', regions: ['asia', 'japan'], support: '2D/3D' },
      { id: 'unionpay', name: 'UnionPay', icon: '💳', type: 'card', regions: ['asia', 'china'], support: '2D/3D' },
      { id: 'googlepay', name: 'Google Pay', icon: 'G Pay', type: 'wallet', regions: ['global'] },
      { id: 'applepay', name: 'Apple Pay', icon: '🍎', type: 'wallet', regions: ['global'] },
      { id: 'paypal', name: 'PayPal', icon: 'P', type: 'wallet', regions: ['global'] },
      { id: 'alipay', name: 'Alipay', icon: '💰', type: 'wallet', regions: ['asia', 'china'] },
      { id: 'wechatpay', name: 'WeChat Pay', icon: '💬', type: 'wallet', regions: ['asia', 'china'] },
      { id: 'bitcoin', name: 'Bitcoin', icon: '₿', type: 'crypto', regions: ['global'] },
      { id: 'ethereum', name: 'Ethereum', icon: '⧫', type: 'crypto', regions: ['global'] },
      { id: 'mpesa', name: 'M-Pesa', icon: '📱', type: 'mobile', regions: ['africa'] },
      { id: 'paysafecard', name: 'Paysafecard', icon: '🛡️', type: 'voucher', regions: ['europe'] },
      { id: 'giftcard', name: 'Gift Cards', icon: '🎁', type: 'voucher', regions: ['global'] },
      { id: 'sofort', name: 'Sofort', icon: '🇩🇪', type: 'bank', regions: ['europe'] },
      { id: 'ideal', name: 'iDEAL', icon: '🇳🇱', type: 'bank', regions: ['europe'] },
      { id: 'sepa', name: 'SEPA', icon: '🇪🇺', type: 'bank', regions: ['europe'] },
      { id: 'boku', name: 'Boku', icon: '📲', type: 'carrier', regions: ['global'] },
    ],
    cards: [
      { id: 'visa', name: 'Visa', icon: '💳', support: '2D/3D Secure' },
      { id: 'mastercard', name: 'Mastercard', icon: '💳', support: '2D/3D Secure' },
      { id: 'amex', name: 'American Express', icon: '💳', support: '2D/3D Secure' },
      { id: 'discover', name: 'Discover', icon: '💳', support: '2D/3D Secure' },
      { id: 'jcb', name: 'JCB', icon: '💳', support: '2D/3D Secure' },
      { id: 'unionpay', name: 'UnionPay', icon: '💳', support: '2D/3D Secure' },
      { id: 'diners', name: 'Diners Club', icon: '💳', support: '2D/3D Secure' },
    ],
    wallets: [
      { id: 'googlepay', name: 'Google Pay', icon: 'G Pay' },
      { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
      { id: 'paypal', name: 'PayPal', icon: 'P' },
      { id: 'alipay', name: 'Alipay', icon: '💰' },
      { id: 'wechatpay', name: 'WeChat Pay', icon: '💬' },
      { id: 'amazonpay', name: 'Amazon Pay', icon: '📦' },
      { id: 'samsungpay', name: 'Samsung Pay', icon: '📱' },
    ],
    crypto: [
      { id: 'bitcoin', name: 'Bitcoin', icon: '₿' },
      { id: 'ethereum', name: 'Ethereum', icon: '⧫' },
      { id: 'litecoin', name: 'Litecoin', icon: 'Ł' },
      { id: 'usdc', name: 'USD Coin', icon: '💵' },
      { id: 'binance', name: 'Binance Pay', icon: 'B' },
    ],
    regional: [
      { id: 'mpesa', name: 'M-Pesa', icon: '📱', region: 'Africa' },
      { id: 'alipay', name: 'Alipay', icon: '💰', region: 'China' },
      { id: 'wechatpay', name: 'WeChat Pay', icon: '💬', region: 'China' },
      { id: 'jcb', name: 'JCB', icon: '💳', region: 'Japan' },
      { id: 'ideal', name: 'iDEAL', icon: '🇳🇱', region: 'Netherlands' },
      { id: 'sofort', name: 'Sofort', icon: '🇩🇪', region: 'Germany' },
      { id: 'blik', name: 'BLIK', icon: '🇵🇱', region: 'Poland' },
      { id: 'pix', name: 'PIX', icon: '🇧🇷', region: 'Brazil' },
      { id: 'upi', name: 'UPI', icon: '🇮🇳', region: 'India' },
    ]
  };

  const regions = [
    { id: 'global', name: '🌍 Global', icon: '🌍' },
    { id: 'europe', name: '🇪🇺 Europe', icon: '🇪🇺' },
    { id: 'us', name: '🇺🇸 United States', icon: '🇺🇸' },
    { id: 'asia', name: '🌏 Asia', icon: '🌏' },
    { id: 'china', name: '🇨🇳 China', icon: '🇨🇳' },
    { id: 'japan', name: '🇯🇵 Japan', icon: '🇯🇵' },
    { id: 'africa', name: '🌍 Africa', icon: '🌍' },
  ];

  const tabs = [
    { id: 'all', name: 'All Methods' },
    { id: 'cards', name: 'Cards' },
    { id: 'wallets', name: 'Digital Wallets' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'regional', name: 'Regional' },
  ];

  // Filter methods based on active tab
  const getFilteredMethods = () => {
    if (activeTab === 'all') {
      return paymentMethods.all.filter(method => 
        userRegion === 'global' || method.regions.includes(userRegion) || method.regions.includes('global')
      );
    }
    return paymentMethods[activeTab];
  };

  const renderMethodCard = (method) => (
    <div key={method.id} className="payment-method-card">
      <div className="method-icon">
        <span className="icon-text">{method.icon}</span>
      </div>
      <div className="method-details">
        <h4>{method.name}</h4>
        {method.support && <span className="support-badge">{method.support}</span>}
        {method.region && <span className="region-badge">{method.region}</span>}
      </div>
      <div className="method-status">
        <div className="status-dot active"></div>
        <span className="status-text">Available</span>
      </div>
    </div>
  );

  const renderRegionMethods = () => (
    <div className="regions-section">
      <h3 className="section-title">Available by Region</h3>
      <div className="regions-grid">
        {regions.map(region => (
          <div 
            key={region.id} 
            className={`region-card ${userRegion === region.id ? 'active' : ''}`}
            onClick={() => setUserRegion(region.id)}
          >
            <div className="region-icon">{region.icon}</div>
            <span className="region-name">{region.name}</span>
            <div className="region-count">
              {paymentMethods.all.filter(m => 
                m.regions.includes(region.id) || m.regions.includes('global')
              ).length} methods
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="global-payment-methods">
      <div className="payment-methods-header">
        <h2>🌐 Global Payment Methods</h2>
        <p className="subtitle">Accept payments from anywhere in the world</p>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="methods-grid">
        {getFilteredMethods().map(renderMethodCard)}
      </div>

      {renderRegionMethods()}

      <div className="features-section">
        <h3 className="section-title">⚡ Key Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h4>3D Secure 2.0</h4>
            <p>Advanced fraud protection for all card payments</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>Global Coverage</h4>
            <p>Accept payments from 190+ countries</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💱</div>
            <h4>Multi-Currency</h4>
            <p>Support for 50+ currencies with auto-conversion</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Instant Processing</h4>
            <p>Real-time payment processing & verification</p>
          </div>
        </div>
      </div>

      <div className="support-section">
        <div className="support-badges">
          <div className="support-badge">
            <span className="badge-icon">🔒</span>
            <span>PCI DSS Level 1</span>
          </div>
          <div className="support-badge">
            <span className="badge-icon">🌐</span>
            <span>Global Compliance</span>
          </div>
          <div className="support-badge">
            <span className="badge-icon">🔄</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPaymentMethods;