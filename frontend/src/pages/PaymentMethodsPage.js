import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PaymentMethodsPage() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card (3D Secure Supported)', icon: '💳' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'paypal', name: 'PayPal', icon: '🔗' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
    { id: 'mobile', name: 'Mobile Money', icon: '📱' },
  ];

  const handleCardChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="payment-form">
            <h3>Card Payment (2D / 3D Secure)</h3>
            <input
              type="text"
              placeholder="Card Number"
              value={cardDetails.number}
              onChange={(e) => handleCardChange('number', e.target.value)}
            />
            <input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => handleCardChange('expiry', e.target.value)}
            />
            <input
              type="text"
              placeholder="CVC"
              value={cardDetails.cvc}
              onChange={(e) => handleCardChange('cvc', e.target.value)}
            />
            <input
              type="text"
              placeholder="Cardholder Name"
              value={cardDetails.name}
              onChange={(e) => handleCardChange('name', e.target.value)}
            />
            <button className="pay-button" onClick={handleCardPayment}>
              Pay Securely
            </button>
          </div>
        );
      case 'crypto':
        return (
          <div className="payment-form">
            <h3>Cryptocurrency Payment</h3>
            <p>Send payment to this wallet address:</p>
            <div className="crypto-address">
              <code>0x742d35Cc6634C0532925a3b844Bc9e37F5A5B6E3</code>
              <button onClick={() => navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b844Bc9e37F5A5B6E3')}>
                Copy
              </button>
            </div>
            <p>Send exact amount in BTC, ETH, or USDT</p>
            <button className="pay-button" onClick={processCryptoPayment}>
              I've Sent Payment
            </button>
          </div>
        );
      default:
        return (
          <div className="payment-form">
            <h3>Direct Payment Instructions</h3>
            <p>Complete payment via your chosen method, then confirm below:</p>
            <button className="pay-button" onClick={processManualPayment}>
              Confirm Payment Made
            </button>
          </div>
        );
    }
  };

  // === Secure 2D/3D Payment Handler (Placeholder Logic) ===
  const handleCardPayment = async () => {
    alert('Processing secure payment...');

    try {
      // Placeholder for backend POST to initiate payment
      const response = await fetch('/api/pay/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardDetails),
      });

      const data = await response.json();

      if (data.requires3DS && data.redirect_url) {
        // For 3D Secure (SCA) - redirect to issuer challenge
        window.location.href = data.redirect_url;
      } else if (data.status === 'succeeded') {
        window.location.href = '/checkout?success=true&method=card';
      } else {
        alert('Payment failed: ' + data.message);
      }
    } catch (err) {
      alert('Payment error: ' + err.message);
    }
  };

  const processCryptoPayment = () => {
    alert('Crypto payment confirmed! We’ll ship after blockchain confirmation.');
    window.location.href = '/checkout?success=true&method=crypto';
  };

  const processManualPayment = () => {
    alert('Payment confirmation received.');
    window.location.href = '/checkout?success=true&method=manual';
  };

  return (
    <div className="page-container">
      <h1>Payment Methods</h1>
      <p>Choose your payment method below:</p>

      <div className="payment-methods-grid">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-method-btn ${selectedMethod === method.id ? 'active' : ''}`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <span className="method-icon">{method.icon}</span>
            {method.name}
          </button>
        ))}
      </div>

      {renderPaymentForm()}

      <div className="payment-info">
        <h3>🔐 Payment Security</h3>
        <p>All card payments are secured with 2D/3D Secure (when applicable).</p>
        <p>Crypto payments require confirmation on blockchain. No OTP or phone verification for manual methods.</p>
      </div>

      <div className="navigation-links">
        <Link to="/cart" className="nav-btn">← Back to Cart</Link>
        <Link to="/checkout" className="nav-btn">Proceed to Checkout →</Link>
      </div>
    </div>
  );
}

export default PaymentMethodsPage;
