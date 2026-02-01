import React, { useState } from 'react';
import { useCart } from '../components/contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, Globe, Smartphone, Bitcoin, Building, Send,
  Lock, Shield, Truck, CheckCircle, AlertCircle,
  Zap, Wallet, Banknote, QrCode
} from 'lucide-react';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  // Currency exchange rates
  const exchangeRates = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.36,
    AUD: 1.51,
    JPY: 147.5,
    CNY: 7.18,
    INR: 83.2,
    NGN: 1260.5,
    ZAR: 18.7,
    BRL: 4.96,
    MXN: 16.85
  };

  const subtotal = getCartTotal();
  const delivery = cartItems.length > 0 ? 9.99 : 0;
  const totalUSD = subtotal + delivery;
  const total = totalUSD * (exchangeRates[selectedCurrency] || 1);

  // Countries for selection
  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'EU', name: 'European Union', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
    { code: 'BR', name: 'Brazil', currency: 'BRL' },
    { code: 'MX', name: 'Mexico', currency: 'MXN' },
  ];

  // Universal payment methods
  const paymentMethods = [
    {
      id: 'card',
      name: 'Any Card Worldwide',
      icon: <CreditCard size={24} />,
      desc: 'All cards accepted - Visa, MasterCard, Amex, UnionPay, Discover',
      global: true
    },
    {
      id: 'bank',
      name: 'Any Bank Transfer',
      icon: <Building size={24} />,
      desc: 'Transfer from any bank in any country',
      global: true
    },
    {
      id: 'digital',
      name: 'Digital Wallets',
      icon: <Smartphone size={24} />,
      desc: 'PayPal, Apple Pay, Google Pay, AliPay, WeChat Pay',
      global: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: <Bitcoin size={24} />,
      desc: 'Bitcoin, Ethereum, USDT, USDC, BNB, Solana',
      global: true
    },
    {
      id: 'remittance',
      name: 'Remittance Services',
      icon: <Send size={24} />,
      desc: 'Western Union, MoneyGram, WorldRemit, Ria',
      global: true
    },
    {
      id: 'local',
      name: 'Local Payment Methods',
      icon: <Wallet size={24} />,
      desc: 'Mobile Money, Cash, Vouchers, Gift Cards',
      global: true
    }
  ];

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    
    // Show success message
    alert('Order placed successfully! No verification required.');
    
    // Clear cart and redirect
    clearCart();
    navigate('/?order=success');
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart before checkout</p>
            <Link 
              to="/" 
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link 
              to="/payment-methods" 
              className="inline-flex items-center text-primary hover:text-blue-700 mb-4"
            >
              ← Choose Payment Method
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping & Payment */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Information (Optional)</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={shippingInfo.name}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone (Optional)"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (Optional)"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Currency Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Currency & Location</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        const country = countries.find(c => c.code === e.target.value);
                        if (country) setSelectedCurrency(country.currency);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2">Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {Object.keys(exchangeRates).map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center h-32 ${
                        paymentMethod === method.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2 text-primary">{method.icon}</div>
                      <div className="font-medium text-sm text-center">{method.name}</div>
                      {method.global && (
                        <div className="mt-1 text-xs text-green-600 flex items-center">
                          <Globe size={10} className="mr-1" />
                          Global
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Selected Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💳 We accept all major credit and debit cards worldwide. No verification required.
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🏦 Bank transfers accepted from any country. No verification required for transfers under $10,000.
                    </p>
                  </div>
                )}

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-sm">
                      <Lock size={16} className="text-green-600 mr-2" />
                      <span>No OTP/Phone Verification</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Shield size={16} className="text-blue-600 mr-2" />
                      <span>Instant Processing</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap size={16} className="text-yellow-600 mr-2" />
                      <span>Order Confirmed Immediately</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Currency Display */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Paying in</div>
                      <div className="text-lg font-bold">{selectedCurrency}</div>
                    </div>
                    <Globe size={20} className="text-primary" />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.price * item.quantity * (exchangeRates[selectedCurrency] || 1), selectedCurrency)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal * (exchangeRates[selectedCurrency] || 1), selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>{formatCurrency(delivery * (exchangeRates[selectedCurrency] || 1), selectedCurrency)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total, selectedCurrency)}</span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-lg font-bold mb-4 flex items-center justify-center ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-primary'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} className="mr-2" />
                      Complete Order (No Verification)
                    </>
                  )}
                </button>

                {/* Security Notes */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle size={14} className="text-green-500 mr-2" />
                    <span>Payment processed instantly</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={14} className="text-green-500 mr-2" />
                    <span>No OTP/phone verification</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle size={14} className="text-green-500 mr-2" />
                    <span>Order confirmed immediately</span>
                  </div>
                </div>
              </div>

              {/* Supported Methods */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-bold text-gray-900 mb-3">Supported Worldwide</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Visa', 'MasterCard', 'PayPal', 'Bitcoin', 'Bank Transfer', 'Apple Pay'].map(provider => (
                    <div key={provider} className="p-2 border rounded text-xs">
                      {provider}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;