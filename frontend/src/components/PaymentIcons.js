import React from 'react';
import './PaymentIcons.css';

const PaymentIcons = () => {
  const icons = [
    { name: 'Visa', symbol: '💳', color: '#1A1F71' },
    { name: 'Mastercard', symbol: '💳', color: '#EB001B' },
    { name: 'Amex', symbol: '💳', color: '#2E77BC' },
    { name: 'G Pay', symbol: 'G Pay', color: '#4285F4' },
    { name: 'Apple Pay', symbol: '🍎', color: '#000000' },
    { name: 'PayPal', symbol: 'P', color: '#003087' },
    { name: 'Bitcoin', symbol: '₿', color: '#F7931A' },
    { name: 'Alipay', symbol: '💰', color: '#00A0E9' },
    { name: 'WeChat', symbol: '💬', color: '#07C160' },
    { name: 'M-Pesa', symbol: '📱', color: '#FF6B35' },
  ];

  return (
    <div className="payment-icons-grid">
      {icons.map((icon, index) => (
        <div key={index} className="payment-icon">
          <div 
            className="icon-circle"
            style={{ backgroundColor: icon.color }}
          >
            <span className="icon-symbol">{icon.symbol}</span>
          </div>
          <span className="icon-name">{icon.name}</span>
        </div>
      ))}
    </div>
  );
};

export default PaymentIcons;