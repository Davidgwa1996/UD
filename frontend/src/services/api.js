// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.unidigital.com/v1';

// Helper function for API calls with enhanced error handling and retry logic
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const market = localStorage.getItem('user_market') || 'US'; // Default to US market
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Market': market, // Add market header for backend routing
      'X-Platform': 'web',
      'X-App-Version': process.env.REACT_APP_VERSION || '1.0.0',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    // Handle 401 Unauthorized - Redirect to login
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 5;
      console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchAPI(endpoint, options); // Retry once
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    
    // For network errors, show user-friendly message
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// Cache manager for frequently accessed data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const api = {
  // Products with global market filtering
  getProducts: async (params = {}) => {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    const queryString = new URLSearchParams(params).toString();
    const data = await fetchAPI(`/products?${queryString}`);
    setCachedData(cacheKey, data);
    return data;
  },

  getProduct: async (id) => {
    const cacheKey = `product_${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    const data = await fetchAPI(`/products/${id}`);
    setCachedData(cacheKey, data);
    return data;
  },

  // Categories with market-specific categorization
  getCategories: async (market = null) => {
    const marketKey = market || localStorage.getItem('user_market') || 'global';
    const cacheKey = `categories_${marketKey}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    const query = market ? `?market=${market}` : '';
    const data = await fetchAPI(`/categories${query}`);
    setCachedData(cacheKey, data);
    return data;
  },

  // Market Data with real-time pricing
  getMarketData: async (country = 'US', productType = null) => {
    const cacheKey = `market_${country}_${productType || 'all'}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    const query = productType ? `&product_type=${productType}` : '';
    const data = await fetchAPI(`/market/trends?country=${country}${query}`);
    setCachedData(cacheKey, data);
    return data;
  },

  // AI Pricing with batch support
  getAiPricing: async (productId, market = null) => {
    const marketParam = market ? `&market=${market}` : '';
    return fetchAPI(`/ai/pricing/${productId}?${marketParam}`);
  },

  getBatchAiPricing: async (productIds, market = 'US') => {
    return fetchAPI('/ai/pricing/batch', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds, market })
    });
  },

  // Search with AI-powered suggestions
  getSearchSuggestions: async (query, market = 'US') => {
    if (query.length < 2) return [];
    
    const cacheKey = `search_${market}_${query.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    const data = await fetchAPI(`/search/suggestions?q=${encodeURIComponent(query)}&market=${market}`);
    setCachedData(cacheKey, data);
    return data;
  },

  // Advanced product search
  searchProducts: async (filters = {}) => {
    return fetchAPI('/search/products', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  },

  // User & Auth with multi-market support
  login: async (email, password, market = 'US') => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, market })
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_market', market);
    }
    
    return response;
  },

  register: async (userData) => {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_market', userData.market || 'US');
    }
    
    return response;
  },

  // Profile management
  getProfile: async () => {
    return fetchAPI('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Cart with persistent storage
  syncCart: async (cartItems) => {
    return fetchAPI('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items: cartItems })
    });
  },

  getCart: async () => {
    return fetchAPI('/cart');
  },

  // Checkout with shipping and tax calculation
  createOrder: async (orderData) => {
    return fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getOrder: async (orderId) => {
    return fetchAPI(`/orders/${orderId}`);
  },

  getUserOrders: async () => {
    return fetchAPI('/orders/user');
  },

  // Shipping with real carrier integration
  calculateShipping: async (address, items, market = 'US') => {
    return fetchAPI('/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ address, items, market })
    });
  },

  getShippingMethods: async (country) => {
    return fetchAPI(`/shipping/methods?country=${country}`);
  },

  // Payment with multiple gateway support
  createPaymentIntent: async (paymentData) => {
    return fetchAPI('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // PayPal specific endpoints
  createPayPalOrder: async (orderData) => {
    return fetchAPI('/payments/paypal/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  capturePayPalOrder: async (orderId) => {
    return fetchAPI(`/payments/paypal/capture/${orderId}`, {
      method: 'POST'
    });
  },

  // Stripe specific endpoints
  createStripePayment: async (paymentData) => {
    return fetchAPI('/payments/stripe/create', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Analytics with market comparison
  getAnalytics: async (timeframe = '7d', market = null) => {
    const marketParam = market ? `&market=${market}` : '';
    return fetchAPI(`/analytics?timeframe=${timeframe}${marketParam}`);
  },

  getSalesTrends: async (period = 'monthly', compareMarkets = false) => {
    return fetchAPI(`/analytics/sales-trends?period=${period}&compare=${compareMarkets}`);
  },

  // Real-time market indicators
  getLiveMarketIndicators: async () => {
    return fetchAPI('/market/indicators/live');
  },

  // Featured deals (AI-curated)
  getFeaturedDeals: async (market = 'US', limit = 10) => {
    return fetchAPI(`/deals/featured?market=${market}&limit=${limit}`);
  },

  // Price alerts
  createPriceAlert: async (productId, targetPrice, market = 'US') => {
    return fetchAPI('/alerts/price', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, target_price: targetPrice, market })
    });
  },

  // Clear cache (useful for development)
  clearCache: () => {
    cache.clear();
  }
};

// Export fetchAPI for custom calls
export { fetchAPI };

// Market-specific API helpers
export const marketAPI = {
  US: {
    getProducts: (params) => api.getProducts({ ...params, market: 'US' }),
    getTaxRate: (zipCode) => fetchAPI(`/tax/us/${zipCode}`),
    getShippingOptions: () => api.getShippingMethods('US')
  },
  GB: {
    getProducts: (params) => api.getProducts({ ...params, market: 'GB' }),
    getVATRate: () => fetchAPI('/tax/gb/vat'),
    getShippingOptions: () => api.getShippingMethods('GB')
  },
  CN: {
    getProducts: (params) => api.getProducts({ ...params, market: 'CN' }),
    getShippingOptions: () => api.getShippingMethods('CN')
  },
  JP: {
    getProducts: (params) => api.getProducts({ ...params, market: 'JP' }),
    getShippingOptions: () => api.getShippingMethods('JP')
  }
};

// WebSocket for real-time updates (optional)
export const setupWebSocket = (onUpdate) => {
  const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'wss://api.unidigital.com/ws');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'price_update') {
      // Update cache with new price
      cache.delete(`product_${data.product_id}`);
    }
    onUpdate?.(data);
  };
  
  return ws;
};