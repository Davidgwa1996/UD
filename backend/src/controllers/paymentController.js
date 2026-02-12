const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const paypal = require('@paypal/checkout-server-sdk');
const axios = require('axios');

// PayPal environment setup
const getPayPalClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.PayPalHttpClient(
      new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
      )
    );
  }
  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_SECRET
    )
  );
};

const paypalClient = getPayPalClient();

// Payment methods by market (aligned with frontend)
const PAYMENT_METHODS_BY_MARKET = {
  GB: [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: '💳', 
      description: 'Visa, Mastercard, American Express',
      gateway: 'stripe'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: '💰', 
      description: 'Pay with your PayPal account',
      gateway: 'paypal'
    },
    { 
      id: 'applepay', 
      name: 'Apple Pay', 
      icon: '🍎', 
      description: 'Fast and secure Apple Pay',
      gateway: 'stripe'
    },
    { 
      id: 'googlepay', 
      name: 'Google Pay', 
      icon: 'G', 
      description: 'Google Pay for Android users',
      gateway: 'stripe'
    },
    { 
      id: 'bank', 
      name: 'Bank Transfer', 
      icon: '🏦', 
      description: 'Direct bank transfer',
      gateway: 'manual'
    }
  ],
  US: [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', gateway: 'stripe' },
    { id: 'paypal', name: 'PayPal', icon: '💰', gateway: 'paypal' },
    { id: 'applepay', name: 'Apple Pay', icon: '🍎', gateway: 'stripe' },
    { id: 'googlepay', name: 'Google Pay', icon: 'G', gateway: 'stripe' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', gateway: 'crypto' },
    { id: 'klarna', name: 'Klarna', icon: '🎯', gateway: 'klarna' }
  ],
  CN: [
    { id: 'alipay', name: 'Alipay', icon: '💸', gateway: 'alipay' },
    { id: 'wechat', name: 'WeChat Pay', icon: '💬', gateway: 'wechat' },
    { id: 'union', name: 'Union Pay', icon: '💳', gateway: 'union' }
  ],
  JP: [
    { id: 'card', name: 'Credit Card', icon: '💳', gateway: 'stripe' },
    { id: 'paypay', name: 'PayPay', icon: '🇯🇵', gateway: 'paypay' },
    { id: 'linepay', name: 'Line Pay', icon: '💚', gateway: 'line' }
  ]
};

// Country/currency mapping
const COUNTRY_CURRENCIES = [
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'EU', name: 'European Union', currency: 'EUR', flag: '🇪🇺' },
  { code: 'AE', name: 'UAE', currency: 'AED', flag: '🇦🇪' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
  { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' }
];

// Exchange rates (simplified - in production use real API)
const EXCHANGE_RATES = {
  'GBP': { 'USD': 1.27, 'EUR': 1.17, 'AED': 4.67, 'AUD': 1.92, 'CAD': 1.70, 'JPY': 187, 'CNY': 9.1 },
  'USD': { 'GBP': 0.79, 'EUR': 0.92, 'AED': 3.67, 'AUD': 1.51, 'CAD': 1.34, 'JPY': 147, 'CNY': 7.17 },
  'EUR': { 'GBP': 0.85, 'USD': 1.09, 'AED': 4.00, 'AUD': 1.64, 'CAD': 1.45, 'JPY': 160, 'CNY': 7.79 },
  'AED': { 'GBP': 0.21, 'USD': 0.27, 'EUR': 0.25 },
  'AUD': { 'GBP': 0.52, 'USD': 0.66, 'EUR': 0.61 },
  'CAD': { 'GBP': 0.59, 'USD': 0.75, 'EUR': 0.69 },
  'JPY': { 'GBP': 0.0053, 'USD': 0.0068, 'EUR': 0.0063 },
  'CNY': { 'GBP': 0.11, 'USD': 0.14, 'EUR': 0.13 }
};

// @desc    Get available payment methods for market
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    const { market = 'GB' } = req.query;
    
    const methods = PAYMENT_METHODS_BY_MARKET[market] || PAYMENT_METHODS_BY_MARKET.GB;

    res.json({
      success: true,
      market,
      methods: methods.map(method => ({
        ...method,
        enabled: true,
        description: getMethodDescription(method.id),
        processingTime: getProcessingTime(method.id)
      }))
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get countries and currencies
// @route   GET /api/payments/countries
// @access  Public
const getCountriesCurrencies = async (req, res) => {
  try {
    res.json({
      success: true,
      countries: COUNTRY_CURRENCIES
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries'
    });
  }
};

// @desc    Calculate currency exchange
// @route   POST /api/payments/calculate-exchange
// @access  Public
const calculateExchange = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Amount, fromCurrency, and toCurrency are required'
      });
    }

    const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
    
    if (!rate) {
      return res.status(400).json({
        success: false,
        message: `Exchange rate not available for ${fromCurrency} to ${toCurrency}`
      });
    }

    const exchangedAmount = amount * rate;

    res.json({
      success: true,
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      exchangeRate: rate,
      exchangedAmount: parseFloat(exchangedAmount.toFixed(2)),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Calculate exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate exchange'
    });
  }
};

// @desc    Create PayPal order
// @route   POST /api/payments/paypal/create
// @access  Private
const createPayPalOrder = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'USD',
      items = [],
      country = 'GB',
      returnUrl,
      cancelUrl 
    } = req.body;
    
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create temporary order for PayPal
    const orderNumber = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    const paypalItems = items.map(item => ({
      name: item.name.substring(0, 127),
      unit_amount: {
        currency_code: 'USD', // PayPal requires USD for API calls
        value: parseFloat(item.price).toFixed(2)
      },
      quantity: item.quantity.toString(),
      category: 'PHYSICAL_GOODS'
    }));

    // Calculate total in USD
    const totalUSD = amount;
    
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: totalUSD.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: totalUSD.toFixed(2)
            }
          }
        },
        items: paypalItems,
        description: `Order from UniDigital Marketplace`,
        custom_id: orderNumber,
        invoice_id: orderNumber
      }],
      application_context: {
        brand_name: 'UniDigital Marketplace',
        landing_page: 'LOGIN',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
        locale: getPayPalLocale(country)
      }
    });

    // Create PayPal order
    const paypalOrder = await paypalClient.execute(request);

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      paymentMethod: 'paypal',
      gateway: 'paypal',
      market: country,
      currency: 'USD',
      amount: totalUSD,
      status: 'pending',
      gatewayOrderId: paypalOrder.result.id,
      gatewayData: {
        create_time: paypalOrder.result.create_time,
        links: paypalOrder.result.links,
        country: country,
        originalCurrency: currency,
        originalAmount: amount
      },
      billingAddress: {
        country: country,
        currency: currency
      }
    });

    res.status(201).json({
      success: true,
      message: 'PayPal order created successfully',
      paymentId: payment._id,
      paypalOrderId: paypalOrder.result.id,
      approvalUrl: paypalOrder.result.links.find(link => link.rel === 'approve').href,
      amount: {
        original: amount,
        originalCurrency: currency,
        usd: totalUSD,
        usdCurrency: 'USD'
      }
    });

  } catch (error) {
    console.error('Create PayPal order error:', error);
    
    // PayPal specific error handling
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: `PayPal error: ${error.message}`,
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Capture PayPal payment
// @route   POST /api/payments/paypal/capture
// @access  Private
const capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    const userId = req.user.id;

    // Get payment record
    const payment = await Payment.findOne({ 
      gatewayOrderId: orderID,
      user: userId 
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Capture PayPal payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    // Update payment status
    payment.status = 'completed';
    payment.gatewayData.capture = capture.result;
    payment.gatewayData.payer = capture.result.payer;
    payment.paidAt = new Date();
    payment.gatewayTransactionId = capture.result.purchase_units[0].payments.captures[0].id;
    await payment.save();

    // Create actual order from payment
    const order = await Order.create({
      user: userId,
      payment: payment._id,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: payment.gatewayData.items || [],
      total: payment.amount,
      currency: payment.currency,
      paymentMethod: 'paypal',
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      shippingAddress: payment.billingAddress,
      billingAddress: payment.billingAddress,
      market: payment.market
    });

    // Update payment with order reference
    payment.order = order._id;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment captured successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: payment.gatewayTransactionId,
        paidAt: payment.paidAt
      },
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency
      },
      captureDetails: {
        id: capture.result.id,
        status: capture.result.status,
        create_time: capture.result.create_time,
        payer: capture.result.payer
      }
    });

  } catch (error) {
    console.error('Capture PayPal order error:', error);
    
    if (error.statusCode === 422) {
      return res.status(422).json({
        success: false,
        message: 'PayPal order cannot be captured. It may already be completed or cancelled.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment'
    });
  }
};

// @desc    Process card payment (simulated for now)
// @route   POST /api/payments/card/process
// @access  Private
const processCardPayment = async (req, res) => {
  try {
    const { 
      amount, 
      currency, 
      country,
      cardDetails,
      billingAddress 
    } = req.body;
    
    const userId = req.user.id;

    // Simulate card processing (in production, integrate with Stripe/other gateway)
    const isSuccessful = Math.random() < 0.95; // 95% success rate
    
    if (!isSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Card payment failed. Please try another card.',
        failureCode: 'CARD_DECLINED'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      paymentMethod: 'card',
      gateway: 'stripe_simulated',
      market: country,
      currency: currency,
      amount: amount,
      status: 'completed',
      cardDetails: {
        lastFour: cardDetails.number.slice(-4),
        brand: getCardBrand(cardDetails.number),
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
        country: country
      },
      billingAddress: billingAddress,
      gatewayTransactionId: `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paidAt: new Date()
    });

    // Create order
    const order = await Order.create({
      user: userId,
      payment: payment._id,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      total: amount,
      currency: currency,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      shippingAddress: billingAddress,
      billingAddress: billingAddress,
      market: country
    });

    // Update payment with order reference
    payment.order = order._id;
    await payment.save();

    res.json({
      success: true,
      message: 'Card payment processed successfully',
      payment: {
        id: payment._id,
        transactionId: payment.gatewayTransactionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      },
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total
      }
    });

  } catch (error) {
    console.error('Process card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process card payment'
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:paymentId
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber status total currency')
      .populate('user', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        gateway: payment.gateway,
        transactionId: payment.gatewayTransactionId,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        market: payment.market,
        order: payment.order
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1, status, method } = req.query;

    const query = { user: userId };
    if (status) query.status = status;
    if (method) query.paymentMethod = method;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('order', 'orderNumber total createdAt');

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// Helper functions
const getMethodDescription = (methodId) => {
  const descriptions = {
    card: 'Visa, Mastercard, American Express',
    paypal: 'Secure payment via PayPal',
    applepay: 'Fast and secure Apple Pay',
    googlepay: 'Google Pay for Android users',
    bank: 'Direct bank transfer',
    crypto: 'Bitcoin, Ethereum, USDC',
    klarna: 'Buy now, pay later',
    alipay: 'Popular in China & Asia',
    wechat: 'WeChat Pay for Chinese users',
    union: 'Union Pay cards',
    paypay: 'Popular in Japan',
    linepay: 'Line Pay for Japanese users'
  };
  return descriptions[methodId] || 'Secure payment method';
};

const getProcessingTime = (methodId) => {
  const times = {
    card: 'Instant',
    paypal: 'Instant',
    applepay: 'Instant',
    googlepay: 'Instant',
    bank: '1-3 business days',
    crypto: '10-30 minutes',
    klarna: 'Instant',
    alipay: 'Instant',
    wechat: 'Instant',
    union: 'Instant',
    paypay: 'Instant',
    linepay: 'Instant'
  };
  return times[methodId] || 'Instant';
};

const getPayPalLocale = (country) => {
  const locales = {
    GB: 'en-GB',
    US: 'en-US',
    EU: 'en-EN',
    CN: 'zh-CN',
    JP: 'ja-JP',
    FR: 'fr-FR',
    DE: 'de-DE',
    ES: 'es-ES',
    IT: 'it-IT'
  };
  return locales[country] || 'en-US';
};

const getCardBrand = (cardNumber) => {
  // Simple card brand detection
  if (cardNumber.startsWith('4')) return 'visa';
  if (cardNumber.startsWith('5')) return 'mastercard';
  if (cardNumber.startsWith('3')) return 'amex';
  if (cardNumber.startsWith('6')) return 'discover';
  return 'unknown';
};

// @desc    Webhook for PayPal notifications
// @route   POST /api/payments/paypal/webhook
// @access  Public
const paypalWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    // Verify webhook signature in production
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalCapture(event.resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalDenied(event.resource);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePayPalRefund(event.resource);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const handlePayPalCapture = async (capture) => {
  const payment = await Payment.findOne({ gatewayTransactionId: capture.id });
  if (payment) {
    payment.status = 'completed';
    payment.gatewayData.capture = capture;
    await payment.save();
  }
};

const handlePayPalDenied = async (capture) => {
  const payment = await Payment.findOne({ gatewayTransactionId: capture.id });
  if (payment) {
    payment.status = 'failed';
    payment.failureReason = capture.status_details?.reason || 'Payment denied';
    await payment.save();
  }
};

const handlePayPalRefund = async (refund) => {
  const payment = await Payment.findOne({ gatewayTransactionId: refund.capture_id });
  if (payment) {
    payment.refunds.push({
      amount: parseFloat(refund.amount.value),
      currency: refund.amount.currency_code,
      gatewayRefundId: refund.id,
      processedAt: new Date()
    });
    payment.totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    await payment.save();
  }
};

module.exports = {
  getPaymentMethods,
  getCountriesCurrencies,
  calculateExchange,
  createPayPalOrder,
  capturePayPalOrder,
  processCardPayment,
  getPaymentStatus,
  getPaymentHistory,
  paypalWebhook
};