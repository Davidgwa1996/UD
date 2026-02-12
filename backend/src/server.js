const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const Logger = require('./utils/logger');
const paypal = require('@paypal/checkout-server-sdk');

// Load environment variables
dotenv.config();

// Initialize PayPal SDK
let environment;
let paypalClient;

if (process.env.PAYPAL_ENVIRONMENT === 'production') {
  environment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}

paypalClient = new paypal.core.PayPalHttpClient(environment);

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Custom request logging
app.use(Logger.request);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ========== PAYPAL PAYMENT ENDPOINTS ========== //

// Create PayPal order
app.post('/api/create-paypal-order', async (req, res) => {
  try {
    const { amount, currency = 'USD', items, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    
    const orderBody = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: parseFloat(amount).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: parseFloat(amount).toFixed(2)
            }
          }
        }
      }],
      application_context: {
        brand_name: 'UniDigital Marketplace',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
        cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel'
      }
    };

    // Add items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      orderBody.purchase_units[0].items = items.map(item => ({
        name: item.name.substring(0, 127), // PayPal max length
        unit_amount: {
          currency_code: currency,
          value: parseFloat(item.price).toFixed(2)
        },
        quantity: item.quantity.toString(),
        description: item.description ? item.description.substring(0, 127) : '',
        category: 'PHYSICAL_GOODS'
      }));
      
      orderBody.purchase_units[0].amount.breakdown.item_total = {
        currency_code: currency,
        value: items.reduce((total, item) => 
          total + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2)
      };
    }

    // Add description if provided
    if (description) {
      orderBody.purchase_units[0].description = description.substring(0, 127);
    }

    request.requestBody(orderBody);

    // Execute PayPal request
    const order = await paypalClient.execute(request);
    
    Logger.info(`PayPal order created: ${order.result.id}`);
    
    res.status(201).json({
      success: true,
      orderID: order.result.id,
      status: order.result.status,
      links: order.result.links
    });
    
  } catch (error) {
    Logger.error('PayPal order creation error:', error);
    
    // Handle specific PayPal errors
    if (error.statusCode === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid PayPal credentials. Please check your API keys.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create PayPal order',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Capture PayPal order
app.post('/api/capture-paypal-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    
    if (!orderID) {
      return res.status(400).json({
        error: 'Missing order ID',
        message: 'Order ID is required to capture payment'
      });
    }

    // Create capture request
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    // Execute capture
    const capture = await paypalClient.execute(request);
    
    Logger.info(`PayPal order captured: ${capture.result.id}`);
    
    // Prepare response
    const paymentData = {
      success: true,
      transactionID: capture.result.id,
      status: capture.result.status,
      amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
      currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
      payer: capture.result.payer,
      create_time: capture.result.create_time,
      update_time: capture.result.update_time,
      links: capture.result.links
    };
    
    // Here you would typically:
    // 1. Save order to database
    // 2. Update inventory
    // 3. Send confirmation email
    // 4. Clear user's cart
    
    res.status(200).json(paymentData);
    
  } catch (error) {
    Logger.error('PayPal capture error:', error);
    
    // Handle specific errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The specified order was not found or has expired'
      });
    }
    
    if (error.statusCode === 422) {
      return res.status(422).json({
        error: 'Payment already captured',
        message: 'This order has already been captured'
      });
    }
    
    res.status(500).json({
      error: 'Failed to capture payment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Payment capture failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get PayPal order details
app.get('/api/paypal-order/:orderID', async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({
        error: 'Order ID required'
      });
    }
    
    const request = new paypal.orders.OrdersGetRequest(orderID);
    const order = await paypalClient.execute(request);
    
    res.status(200).json({
      success: true,
      order: order.result
    });
    
  } catch (error) {
    Logger.error('PayPal get order error:', error);
    res.status(500).json({
      error: 'Failed to get order details',
      message: error.message
    });
  }
});

// Webhook endpoint for PayPal notifications
app.post('/api/paypal-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookEvent = req.body;
    
    // Verify webhook signature (implement based on PayPal docs)
    // For production, use PayPal's webhook verification
    
    Logger.info('PayPal webhook received:', webhookEvent.event_type);
    
    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle completed payment
        Logger.info('Payment completed:', webhookEvent.resource.id);
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle denied payment
        Logger.warn('Payment denied:', webhookEvent.resource.id);
        break;
        
      case 'PAYMENT.CAPTURE.REFUNDED':
        // Handle refund
        Logger.info('Payment refunded:', webhookEvent.resource.id);
        break;
        
      default:
        Logger.info('Unhandled webhook event:', webhookEvent.event_type);
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    Logger.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ========== END PAYPAL ENDPOINTS ========== //

// Health check endpoint
app.get('/api/health', (req, res) => {
  const paypalStatus = paypalClient ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'healthy',
    service: 'Unidigitalcom Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    features: {
      paypal: paypalStatus,
      database: 'connected',
      authentication: 'enabled'
    }
  });
});

// Welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Unidigitalcom API',
    version: '2.0.0',
    features: [
      'User Authentication & Authorization',
      'Product Management',
      'Shopping Cart',
      'Order Processing',
      'PayPal Payment Integration',
      'Real-time Market Data',
      'AI Pricing Engine'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      paypal: {
        createOrder: 'POST /api/create-paypal-order',
        captureOrder: 'POST /api/capture-paypal-order',
        getOrder: 'GET /api/paypal-order/:orderID'
      },
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 UniDigital Backend API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    features: {
      paypal: 'Integrated',
      stripe: 'Coming Soon',
      alipay: 'Coming Soon',
      wechat_pay: 'Coming Soon'
    },
    documentation: '/api',
    health: '/health',
    endpoints: {
      root: '/',
      api: '/api',
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      paypal: {
        create: 'POST /api/create-paypal-order',
        capture: 'POST /api/capture-paypal-order'
      }
    }
  });
});

// Health endpoint (simple, for load balancers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      database: 'connected',
      paypal: paypalClient ? 'connected' : 'disconnected'
    }
  });
});

// API welcome endpoint (already exists, but keep it)
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Unidigitalcom API',
    version: '2.0.0',
    features: [
      'User Authentication & Authorization',
      'Product Management',
      'Shopping Cart',
      'Order Processing',
      'PayPal Payment Integration',
      'Real-time Market Data',
      'AI Pricing Engine'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      paypal: {
        createOrder: 'POST /api/create-paypal-order',
        captureOrder: 'POST /api/capture-paypal-order',
        getOrder: 'GET /api/paypal-order/:orderID'
      },
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  Logger.api(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  Logger.api(`📊 Health check: http://localhost:${PORT}/api/health`);
  Logger.api(`🔗 API Base URL: http://localhost:${PORT}/api`);
  Logger.api(`💳 PayPal: ${process.env.PAYPAL_ENVIRONMENT === 'production' ? 'Production Mode' : 'Sandbox Mode'}`);
  
  // Test PayPal connection
  if (paypalClient) {
    Logger.api(`✅ PayPal SDK initialized successfully`);
  } else {
    Logger.warn(`⚠️ PayPal SDK not initialized. Check your environment variables.`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  Logger.error(`💥 Unhandled Rejection: ${err.message}`);
  Logger.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  Logger.error(`💥 Uncaught Exception: ${err.message}`);
  Logger.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.warn('⚠️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    Logger.info('✅ Server closed. Process terminated.');
    process.exit(0);
  });
});

module.exports = app;