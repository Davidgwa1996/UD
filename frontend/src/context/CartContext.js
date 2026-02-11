import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Currency conversion rates (in real app, fetch from API)
const currencyRates = {
  GBP: 1,
  USD: 1.28,
  EUR: 1.17,
  JPY: 190.5,
  CNY: 9.15,
  ZAR: 23.45,
  NGN: 1500.50,
  KES: 200.30,
  AUD: 1.92,
  CAD: 1.72,
  CHF: 1.10,
  INR: 106.45,
};

// Global payment methods configuration
const globalPaymentMethods = {
  cards: [
    { id: 'visa', name: 'Visa', supports3DSecure: true, regions: ['global'] },
    { id: 'mastercard', name: 'Mastercard', supports3DSecure: true, regions: ['global'] },
    { id: 'amex', name: 'American Express', supports3DSecure: true, regions: ['global'] },
    { id: 'discover', name: 'Discover', supports3DSecure: true, regions: ['us'] },
    { id: 'jcb', name: 'JCB', supports3DSecure: true, regions: ['asia', 'japan'] },
    { id: 'unionpay', name: 'UnionPay', supports3DSecure: true, regions: ['asia', 'china'] },
  ],
  wallets: [
    { id: 'googlepay', name: 'Google Pay', regions: ['global'] },
    { id: 'applepay', name: 'Apple Pay', regions: ['global'] },
    { id: 'paypal', name: 'PayPal', regions: ['global'] },
    { id: 'alipay', name: 'Alipay', regions: ['asia', 'china'] },
    { id: 'wechatpay', name: 'WeChat Pay', regions: ['asia', 'china'] },
  ],
  crypto: [
    { id: 'bitcoin', name: 'Bitcoin', regions: ['global'] },
    { id: 'ethereum', name: 'Ethereum', regions: ['global'] },
    { id: 'usdc', name: 'USD Coin', regions: ['global'] },
  ],
  regional: [
    { id: 'mpesa', name: 'M-Pesa', regions: ['africa', 'kenya', 'tanzania'] },
    { id: 'pix', name: 'PIX', regions: ['brazil'] },
    { id: 'upi', name: 'UPI', regions: ['india'] },
    { id: 'ideal', name: 'iDEAL', regions: ['europe', 'netherlands'] },
    { id: 'sofort', name: 'Sofort', regions: ['europe', 'germany'] },
  ]
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.payload
      };

    case 'SET_REGION':
      return {
        ...state,
        region: action.payload,
        // Auto-set currency based on region
        currency: getDefaultCurrencyForRegion(action.payload)
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        selectedPaymentMethod: action.payload
      };

    case 'SET_CURRENCY_RATES':
      return {
        ...state,
        currencyRates: { ...state.currencyRates, ...action.payload }
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    case 'SET_GIFT_CARD':
      return {
        ...state,
        appliedGiftCard: action.payload
      };

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload
      };

    default:
      return state;
  }
};

// Helper function to get default currency for region
const getDefaultCurrencyForRegion = (region) => {
  const regionCurrencyMap = {
    'europe': 'EUR',
    'us': 'USD',
    'uk': 'GBP',
    'japan': 'JPY',
    'china': 'CNY',
    'africa': 'USD', // Default to USD for Africa
    'global': 'USD',
  };
  return regionCurrencyMap[region] || 'USD';
};

// Helper function to convert amount between currencies
const convertCurrency = (amount, fromCurrency, toCurrency, rates = currencyRates) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base (GBP) then to target
  const baseRate = rates[fromCurrency] || 1;
  const targetRate = rates[toCurrency] || 1;
  
  const amountInBase = amount / baseRate;
  return amountInBase * targetRate;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    currency: 'GBP',
    region: 'global',
    selectedPaymentMethod: null,
    currencyRates: currencyRates,
    appliedGiftCard: null,
    shippingAddress: null,
    availablePaymentMethods: getAvailablePaymentMethods('global')
  });

  // Calculate totals with currency conversion
  const calculateCartTotal = () => {
    const baseTotal = state.items.reduce((total, item) => {
      // Convert item price to current currency if needed
      const itemPrice = item.currency && item.currency !== state.currency 
        ? convertCurrency(item.price, item.currency, state.currency, state.currencyRates)
        : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    
    return baseTotal;
  };

  const cartTotal = calculateCartTotal();
  const cartCount = state.items.reduce((count, item) => count + item.quantity, 0);

  // Calculate total after gift card discount
  const cartTotalAfterDiscount = state.appliedGiftCard 
    ? Math.max(0, cartTotal - (state.appliedGiftCard.balance || 0))
    : cartTotal;

  // Get available payment methods for current region
  function getAvailablePaymentMethods(region) {
    const allMethods = [
      ...globalPaymentMethods.cards,
      ...globalPaymentMethods.wallets,
      ...globalPaymentMethods.crypto,
      ...globalPaymentMethods.regional
    ];
    
    return allMethods.filter(method => 
      method.regions.includes('global') || 
      method.regions.includes(region)
    );
  }

  const addToCart = (product, quantity = 1, productCurrency = 'GBP') => {
    console.log('Adding to cart:', product.name, 'Quantity:', quantity);
    const productWithCurrency = {
      ...product,
      quantity,
      currency: productCurrency,
      // Convert price to current currency if different
      price: product.currency && product.currency !== productCurrency
        ? convertCurrency(product.price, product.currency, productCurrency, state.currencyRates)
        : product.price
    };
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: productWithCurrency
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCurrency = (currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  const setRegion = (region) => {
    dispatch({ type: 'SET_REGION', payload: region });
    // Update available payment methods for the region
    const methods = getAvailablePaymentMethods(region);
    updateAvailablePaymentMethods(methods);
  };

  const setPaymentMethod = (paymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: paymentMethod });
  };

  const updateCurrencyRates = (newRates) => {
    dispatch({ type: 'SET_CURRENCY_RATES', payload: newRates });
  };

  const applyGiftCard = (giftCard) => {
    dispatch({ type: 'SET_GIFT_CARD', payload: giftCard });
  };

  const removeGiftCard = () => {
    dispatch({ type: 'SET_GIFT_CARD', payload: null });
  };

  const setShippingAddress = (address) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  };

  const updateAvailablePaymentMethods = (methods) => {
    return methods;
  };

  // Save cart to localStorage whenever items change
  useEffect(() => {
    console.log('Saving cart to localStorage:', state.items);
    const cartData = {
      items: state.items,
      currency: state.currency,
      region: state.region,
      selectedPaymentMethod: state.selectedPaymentMethod,
      appliedGiftCard: state.appliedGiftCard
    };
    localStorage.setItem('unidigital_cart', JSON.stringify(cartData));
  }, [state.items, state.currency, state.region, state.selectedPaymentMethod, state.appliedGiftCard]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('unidigital_cart');
    
    console.log('Loading from localStorage - Cart:', savedCart);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart:', parsedCart);
        
        // Load items
        if (parsedCart.items) {
          dispatch({
            type: 'LOAD_CART',
            payload: parsedCart.items
          });
        }
        
        // Load currency and region
        if (parsedCart.currency) {
          dispatch({ type: 'SET_CURRENCY', payload: parsedCart.currency });
        }
        
        if (parsedCart.region) {
          setRegion(parsedCart.region);
        }
        
        if (parsedCart.selectedPaymentMethod) {
          dispatch({ type: 'SET_PAYMENT_METHOD', payload: parsedCart.selectedPaymentMethod });
        }
        
        if (parsedCart.appliedGiftCard) {
          dispatch({ type: 'SET_GIFT_CARD', payload: parsedCart.appliedGiftCard });
        }
        
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('unidigital_cart');
      }
    }
  }, []);

  // Fetch updated currency rates periodically
  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        // In production, use a real API like exchangerate-api.com
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
        // const data = await response.json();
        // updateCurrencyRates(data.rates);
        
        console.log('Currency rates loaded');
      } catch (error) {
        console.error('Error fetching currency rates:', error);
      }
    };

    fetchCurrencyRates();
    // Refresh rates every hour
    const interval = setInterval(fetchCurrencyRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    // Cart State
    items: state.items,
    cartTotal,
    cartTotalAfterDiscount,
    cartCount,
    
    // Currency & Region
    currency: state.currency,
    region: state.region,
    currencyRates: state.currencyRates,
    
    // Payment Methods
    selectedPaymentMethod: state.selectedPaymentMethod,
    availablePaymentMethods: getAvailablePaymentMethods(state.region),
    supportedCurrencies: Object.keys(currencyRates),
    
    // Gift Cards & Address
    appliedGiftCard: state.appliedGiftCard,
    shippingAddress: state.shippingAddress,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCurrency,
    setRegion,
    setPaymentMethod,
    applyGiftCard,
    removeGiftCard,
    setShippingAddress,
    convertCurrency,
    
    // Helper Functions
    formatPrice: (amount, currency = state.currency) => {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      });
      return formatter.format(amount);
    },
    
    getSupportedPaymentMethods: () => {
      const methods = getAvailablePaymentMethods(state.region);
      
      // Categorize methods
      return {
        cards: methods.filter(m => globalPaymentMethods.cards.some(card => card.id === m.id)),
        wallets: methods.filter(m => globalPaymentMethods.wallets.some(wallet => wallet.id === m.id)),
        crypto: methods.filter(m => globalPaymentMethods.crypto.some(crypto => crypto.id === m.id)),
        regional: methods.filter(m => globalPaymentMethods.regional.some(regional => regional.id === m.id)),
      };
    },
    
    // Check if payment method supports 3D Secure
    supports3DSecure: (paymentMethodId) => {
      const method = [
        ...globalPaymentMethods.cards,
        ...globalPaymentMethods.wallets
      ].find(m => m.id === paymentMethodId);
      
      return method ? method.supports3DSecure || false : false;
    }
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};