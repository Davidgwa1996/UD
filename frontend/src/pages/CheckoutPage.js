import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, Globe, Smartphone, Bitcoin, Building, Send,
  Lock, Shield, Truck, CheckCircle, Wallet,
  Zap, Banknote, QrCode, ArrowLeft, ShieldCheck,
  Gift, Package, Globe as GlobeIcon, ChevronDown, ChevronUp,
  Smartphone as Mobile, Shield as SecureIcon,
  CreditCard as CardIcon
} from 'lucide-react';

function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    items, 
    cartTotal, 
    cartTotalAfterDiscount,
    cartCount,
    currency, 
    region,
    selectedPaymentMethod,
    availablePaymentMethods,
    supportedCurrencies,
    formatPrice,
    setCurrency,
    setRegion,
    setPaymentMethod,
    applyGiftCard,
    removeGiftCard,
    appliedGiftCard,
    clearCart,
    supports3DSecure
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: ''
  });

  // Regions configuration
  const regions = [
    { id: 'global', name: '🌍 Global', icon: '🌍', color: 'from-blue-500 to-cyan-500' },
    { id: 'europe', name: '🇪🇺 Europe', icon: '🇪🇺', color: 'from-purple-500 to-indigo-500' },
    { id: 'us', name: '🇺🇸 United States', icon: '🇺🇸', color: 'from-red-500 to-blue-500' },
    { id: 'asia', name: '🌏 Asia', icon: '🌏', color: 'from-orange-500 to-yellow-500' },
    { id: 'china', name: '🇨🇳 China', icon: '🇨🇳', color: 'from-red-500 to-yellow-500' },
    { id: 'japan', name: '🇯🇵 Japan', icon: '🇯🇵', color: 'from-red-500 to-white' },
    { id: 'africa', name: '🌍 Africa', icon: '🌍', color: 'from-green-500 to-yellow-500' },
    { id: 'latin-america', name: '🌎 Latin America', icon: '🌎', color: 'from-green-500 to-blue-500' },
  ];

  // Payment methods with enhanced details
  const paymentMethodsConfig = {
    cards: [
      { 
        id: 'visa', 
        name: 'Visa', 
        icon: '💳', 
        desc: 'All Visa cards',
        color: 'from-blue-900 to-blue-700',
        supports3DSecure: true
      },
      { 
        id: 'mastercard', 
        name: 'Mastercard', 
        icon: '💳', 
        desc: 'All Mastercard',
        color: 'from-red-600 to-orange-500',
        supports3DSecure: true
      },
      { 
        id: 'amex', 
        name: 'American Express', 
        icon: '💳', 
        desc: 'AMEX cards',
        color: 'from-blue-800 to-cyan-500',
        supports3DSecure: true
      },
      { 
        id: 'discover', 
        name: 'Discover', 
        icon: '💳', 
        desc: 'Discover Network',
        color: 'from-orange-600 to-orange-400',
        supports3DSecure: true
      },
      { 
        id: 'jcb', 
        name: 'JCB', 
        icon: '💳', 
        desc: 'Japan Credit Bureau',
        color: 'from-red-700 to-red-500',
        supports3DSecure: true
      },
      { 
        id: 'unionpay', 
        name: 'UnionPay', 
        icon: '💳', 
        desc: 'Chinese payment network',
        color: 'from-red-600 to-yellow-500',
        supports3DSecure: true
      },
    ],
    wallets: [
      { 
        id: 'googlepay', 
        name: 'Google Pay', 
        icon: 'G Pay', 
        desc: 'Fast & secure by Google',
        color: 'from-blue-500 to-blue-400'
      },
      { 
        id: 'applepay', 
        name: 'Apple Pay', 
        icon: '🍎', 
        desc: 'Apple devices only',
        color: 'from-gray-800 to-gray-600'
      },
      { 
        id: 'paypal', 
        name: 'PayPal', 
        icon: 'P', 
        desc: 'Worldwide e-wallet',
        color: 'from-blue-800 to-blue-600'
      },
      { 
        id: 'alipay', 
        name: 'Alipay', 
        icon: '💰', 
        desc: 'Popular in China',
        color: 'from-blue-500 to-teal-400'
      },
      { 
        id: 'wechatpay', 
        name: 'WeChat Pay', 
        icon: '💬', 
        desc: 'WeChat integrated',
        color: 'from-green-600 to-green-400'
      },
    ],
    crypto: [
      { 
        id: 'bitcoin', 
        name: 'Bitcoin', 
        icon: '₿', 
        desc: 'Original cryptocurrency',
        color: 'from-orange-600 to-yellow-500'
      },
      { 
        id: 'ethereum', 
        name: 'Ethereum', 
        icon: '⧫', 
        desc: 'Smart contract platform',
        color: 'from-purple-600 to-pink-500'
      },
      { 
        id: 'usdc', 
        name: 'USD Coin', 
        icon: '💵', 
        desc: 'Stablecoin (1:1 USD)',
        color: 'from-blue-600 to-cyan-500'
      },
    ],
    regional: [
      { 
        id: 'mpesa', 
        name: 'M-Pesa', 
        icon: '📱', 
        desc: 'Mobile money in Africa',
        color: 'from-green-600 to-yellow-500'
      },
      { 
        id: 'ideal', 
        name: 'iDEAL', 
        icon: '🇳🇱', 
        desc: 'Dutch bank transfers',
        color: 'from-orange-600 to-red-500'
      },
      { 
        id: 'sofort', 
        name: 'Sofort', 
        icon: '🇩🇪', 
        desc: 'German online banking',
        color: 'from-yellow-500 to-red-500'
      },
      { 
        id: 'pix', 
        name: 'PIX', 
        icon: '🇧🇷', 
        desc: 'Brazil instant payments',
        color: 'from-green-500 to-yellow-500'
      },
      { 
        id: 'upi', 
        name: 'UPI', 
        icon: '🇮🇳', 
        desc: 'Indian mobile payments',
        color: 'from-orange-500 to-green-500'
      },
    ]
  };

  // Features matching global payments
  const features = [
    { icon: <Shield />, title: 'Bank-Level Security', desc: '256-bit encryption & PCI DSS Level 1' },
    { icon: <Zap />, title: 'Instant Processing', desc: 'Real-time payment confirmation' },
    { icon: <GlobeIcon />, title: '150+ Currencies', desc: 'Global currency support' },
    { icon: <Lock />, title: '3D Secure 2.0', desc: 'Advanced fraud protection' },
  ];

  // Calculate shipping and tax (you can modify these)
  const shippingAmount = cartTotal > 100 ? 0 : 9.99;
  const taxAmount = cartTotal * 0.1; // 10% tax
  const grandTotal = cartTotal + shippingAmount + taxAmount;

  // Get all payment methods for current region
  const getPaymentMethodsForRegion = () => {
    const allMethods = [
      ...paymentMethodsConfig.cards,
      ...paymentMethodsConfig.wallets,
      ...paymentMethodsConfig.crypto,
      ...paymentMethodsConfig.regional
    ];
    
    return allMethods.filter(method => 
      availablePaymentMethods.some(avail => avail.id === method.id)
    );
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyGiftCard = () => {
    if (!giftCardCode.trim()) {
      alert('Please enter a gift card code');
      return;
    }
    
    // In real app, validate with backend
    applyGiftCard({
      code: giftCardCode,
      balance: 50, // Example balance
      applied: true
    });
    
    setGiftCardCode('');
  };

  const handleCompleteOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.email) {
      alert('Please fill in all required shipping information');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with actual payment gateway
      // For example:
      // if (selectedPaymentMethod === 'paypal') {
      //   await processPayPalPayment();
      // } else if (selectedPaymentMethod.includes('card')) {
      //   await processCardPayment();
      // }
      
      // Show success message
      alert(`Payment successful using ${selectedPaymentMethod}!`);
      
      // Clear cart and redirect
      clearCart();
      navigate('/checkout-success');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">Add some products to your cart before checkout</p>
              <Link 
                to="/" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={20} />
              Back to Cart
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
            <p className="text-gray-600">Secure checkout with global payment options</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Steps */}
            <div className="lg:col-span-2 space-y-8">
              {/* Global Features */}
              <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="text-center">
                      <div className="inline-block p-3 bg-white/10 rounded-xl backdrop-blur-sm mb-2">
                        {feature.icon}
                      </div>
                      <div className="text-sm font-medium">{feature.title}</div>
                      <div className="text-xs opacity-80">{feature.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region Selection */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-green-600" />
                  Select Region & Currency
                </h3>
                
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-3">Your Region</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {regions.map(reg => (
                      <button
                        key={reg.id}
                        onClick={() => setRegion(reg.id)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          region === reg.id
                            ? `border-blue-500 bg-gradient-to-br ${reg.color} text-white shadow-lg`
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-2xl mb-2">{reg.icon}</div>
                        <div className="font-medium text-sm">{reg.name.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Selected: <span className="font-bold">{region.toUpperCase()}</span> • Affects available payment methods
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-3">Select Currency</h4>
                  <div className="flex flex-wrap gap-2">
                    {supportedCurrencies.slice(0, showAllCurrencies ? undefined : 8).map(curr => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          currency === curr
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                    {supportedCurrencies.length > 8 && (
                      <button
                        onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {showAllCurrencies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Global Payment Support</div>
                      <div className="text-sm text-gray-600">
                        {getPaymentMethodsForRegion().length} payment methods available in {region}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Truck className="h-6 w-6 text-blue-600" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={shippingInfo.name}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="123 Main Street"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="10001"
                      value={shippingInfo.postalCode}
                      onChange={handleShippingChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Gift Card Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Gift className="h-6 w-6 text-pink-600" />
                  Gift Card / Promo Code
                </h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter gift card or promo code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <button
                    onClick={handleApplyGiftCard}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-4 rounded-xl font-medium hover:from-pink-600 hover:to-rose-700 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {appliedGiftCard && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-green-800">Gift Card Applied</div>
                        <div className="text-sm text-green-600">Balance: {formatPrice(appliedGiftCard.balance)}</div>
                      </div>
                      <button
                        onClick={removeGiftCard}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h3>
                
                {/* Payment Method Tabs */}
                <div className="mb-8">
                  <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    <button
                      onClick={() => setShowPaymentDetails(true)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                        showPaymentDetails
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Methods
                    </button>
                    <button
                      onClick={() => setShowPaymentDetails(false)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                        !showPaymentDetails
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Quick Select
                    </button>
                  </div>

                  {showPaymentDetails ? (
                    /* Detailed Payment Methods View */
                    <div className="space-y-6">
                      {Object.entries(paymentMethodsConfig).map(([category, methods]) => {
                        const availableMethods = methods.filter(method => 
                          getPaymentMethodsForRegion().some(m => m.id === method.id)
                        );
                        
                        if (availableMethods.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="font-bold text-gray-900 mb-4 capitalize">
                              {category === 'cards' ? '💳 Credit/Debit Cards' :
                               category === 'wallets' ? '📱 Digital Wallets' :
                               category === 'crypto' ? '₿ Cryptocurrency' :
                               '🌍 Regional Methods'}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {availableMethods.map(method => (
                                <button
                                  key={method.id}
                                  onClick={() => setPaymentMethod(method.id)}
                                  className={`p-4 rounded-xl border-2 flex flex-col transition-all ${
                                    selectedPaymentMethod === method.id
                                      ? `border-blue-500 bg-gradient-to-br ${method.color} text-white shadow-lg`
                                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-2xl">{method.icon}</div>
                                    {method.supports3DSecure && (
                                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                        3D Secure
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-bold text-left">{method.name}</div>
                                  <div className="text-sm text-left opacity-90">{method.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Quick Select View */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {getPaymentMethodsForRegion().slice(0, 8).map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="text-2xl mb-2">{method.icon || '💳'}</div>
                          <div className="font-medium text-center text-sm">{method.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Payment Details */}
                {selectedPaymentMethod && (
                  <div className="mt-8 pt-8 border-t">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getPaymentMethodsForRegion().find(m => m.id === selectedPaymentMethod)?.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {getPaymentMethodsForRegion().find(m => m.id === selectedPaymentMethod)?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {supports3DSecure(selectedPaymentMethod) 
                                ? '3D Secure Enabled • Extra Fraud Protection'
                                : 'Secure Payment Method'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <ShieldCheck className="h-5 w-5" />
                          <span className="font-medium">Secure</span>
                        </div>
                      </div>
                      
                      {selectedPaymentMethod.includes('card') && (
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Security Badges */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Lock className="h-4 w-4 text-blue-600" />
                            <span>256-bit SSL</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span>PCI DSS Level 1</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span>Instant Processing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                {/* Region & Currency Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Region</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{regions.find(r => r.id === region)?.icon}</span>
                      <span className="font-bold">{region.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-600">Currency</div>
                    <div className="font-bold text-lg">{currency}</div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingAmount === 0 ? 'FREE' : formatPrice(shippingAmount)}
                    </span>
                  </div>
                  {appliedGiftCard && (
                    <div className="flex justify-between text-green-600">
                      <span>Gift Card Discount</span>
                      <span className="font-medium">-{formatPrice(appliedGiftCard.balance)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(cartTotalAfterDiscount || grandTotal)}</span>
                    </div>
                    {currency !== 'USD' && (
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        ≈ {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format((cartTotalAfterDiscount || grandTotal) / 1.28)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Complete Order Button */}
                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing || !selectedPaymentMethod}
                  className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all duration-300 ${
                    isProcessing || !selectedPaymentMethod
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-green-600 hover:to-emerald-700 hover:shadow-lg'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3 inline-block"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="inline-block mr-3 h-6 w-6" />
                      Pay {formatPrice(cartTotalAfterDiscount || grandTotal)}
                    </>
                  )}
                </button>

                {!selectedPaymentMethod && (
                  <div className="text-center text-sm text-red-600 mb-4">
                    Please select a payment method
                  </div>
                )}

                {/* Global Payment Providers */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-3 text-center">Supported Globally</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Visa', 'MasterCard', 'PayPal', 'Bitcoin', 'M-Pesa', 'Alipay'].map(provider => (
                      <div key={provider} className="p-2 bg-gray-100 rounded-lg text-center text-xs font-medium">
                        {provider}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security & Support */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <Link 
                    to="/global-payments"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="h-5 w-5" />
                    <span>View All Payment Methods</span>
                  </Link>
                  <Link 
                    to="/contact"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800"
                  >
                    <Shield className="h-5 w-5" />
                    <span>24/7 Support</span>
                  </Link>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <SecureIcon className="h-4 w-4 text-green-600" />
                        <span>Your payment is secure and encrypted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <span>We never store your payment details</span>
                      </div>
                    </div>
                  </div>
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