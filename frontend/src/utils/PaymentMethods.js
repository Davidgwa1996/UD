// Payment method configurations
export const paymentMethodConfigs = {
  // Card networks
  visa: {
    name: 'Visa',
    icon: '💳',
    type: 'card',
    regions: ['global'],
    supports3DSecure: true,
    countries: ['all']
  },
  mastercard: {
    name: 'Mastercard',
    icon: '💳',
    type: 'card',
    regions: ['global'],
    supports3DSecure: true,
    countries: ['all']
  },
  amex: {
    name: 'American Express',
    icon: '💳',
    type: 'card',
    regions: ['global'],
    supports3DSecure: true,
    countries: ['all']
  },
  discover: {
    name: 'Discover',
    icon: '💳',
    type: 'card',
    regions: ['us'],
    supports3DSecure: true,
    countries: ['US']
  },
  jcb: {
    name: 'JCB',
    icon: '💳',
    type: 'card',
    regions: ['asia', 'japan'],
    supports3DSecure: true,
    countries: ['JP', 'TH', 'SG']
  },
  unionpay: {
    name: 'UnionPay',
    icon: '💳',
    type: 'card',
    regions: ['asia', 'china'],
    supports3DSecure: true,
    countries: ['CN', 'HK', 'MO']
  },
  
  // Digital Wallets
  googlepay: {
    name: 'Google Pay',
    icon: 'G Pay',
    type: 'wallet',
    regions: ['global'],
    countries: ['all']
  },
  applepay: {
    name: 'Apple Pay',
    icon: '🍎',
    type: 'wallet',
    regions: ['global'],
    countries: ['all']
  },
  paypal: {
    name: 'PayPal',
    icon: 'P',
    type: 'wallet',
    regions: ['global'],
    countries: ['all']
  },
  alipay: {
    name: 'Alipay',
    icon: '💰',
    type: 'wallet',
    regions: ['asia', 'china'],
    countries: ['CN']
  },
  wechatpay: {
    name: 'WeChat Pay',
    icon: '💬',
    type: 'wallet',
    regions: ['asia', 'china'],
    countries: ['CN']
  },
  
  // Cryptocurrency
  bitcoin: {
    name: 'Bitcoin',
    icon: '₿',
    type: 'crypto',
    regions: ['global'],
    countries: ['all']
  },
  ethereum: {
    name: 'Ethereum',
    icon: '⧫',
    type: 'crypto',
    regions: ['global'],
    countries: ['all']
  },
  
  // Regional Methods
  mpesa: {
    name: 'M-Pesa',
    icon: '📱',
    type: 'mobile',
    regions: ['africa'],
    countries: ['KE', 'TZ', 'UG']
  },
  ideal: {
    name: 'iDEAL',
    icon: '🇳🇱',
    type: 'bank',
    regions: ['europe'],
    countries: ['NL']
  },
  sofort: {
    name: 'Sofort',
    icon: '🇩🇪',
    type: 'bank',
    regions: ['europe'],
    countries: ['DE', 'AT', 'CH']
  },
  blik: {
    name: 'BLIK',
    icon: '🇵🇱',
    type: 'mobile',
    regions: ['europe'],
    countries: ['PL']
  },
  pix: {
    name: 'PIX',
    icon: '🇧🇷',
    type: 'bank',
    regions: ['latin-america'],
    countries: ['BR']
  },
  upi: {
    name: 'UPI',
    icon: '🇮🇳',
    type: 'mobile',
    regions: ['asia'],
    countries: ['IN']
  }
};

// Get payment methods available for a specific country
export const getPaymentMethodsForCountry = (countryCode, region) => {
  return Object.values(paymentMethodConfigs).filter(method => {
    const isInRegion = method.regions.includes('global') || method.regions.includes(region);
    const isInCountry = method.countries.includes('all') || method.countries.includes(countryCode);
    return isInRegion && isInCountry;
  });
};

// Get all supported countries for a payment method
export const getSupportedCountries = (paymentMethodId) => {
  const method = paymentMethodConfigs[paymentMethodId];
  return method ? method.countries : [];
};

// Check if payment method supports 2D/3D cards
export const isCardMethod = (paymentMethodId) => {
  const cardMethods = ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay'];
  return cardMethods.includes(paymentMethodId);
};