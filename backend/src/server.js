// ==================================================================
// server.js - UniDigital Backend API v2.0 (Enhanced with Email Verification)
// ==================================================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const Logger = require('./utils/logger');

// ==================================================================
// 1. INITIALIZE PAYPAL SDK
// ==================================================================
let paypal, paypalClient;
try {
  paypal = require('@paypal/checkout-server-sdk');
  
  let environment;
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
  Logger.success('✅ PayPal SDK initialized successfully');
} catch (error) {
  Logger.warn('⚠️ PayPal SDK not initialized:', error.message);
  paypalClient = null;
}

// ==================================================================
// 2. IMPORT ROUTES
// ==================================================================
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// ==================================================================
// 3. IMPORT MIDDLEWARE
// ==================================================================
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { securityHeaders } = require('./middleware/securityMiddleware');

// ==================================================================
// 4. INITIALIZE EXPRESS
// ==================================================================
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// ==================================================================
// 5. CONNECT TO DATABASE
// ==================================================================
connectDB();

// ==================================================================
// 6. CORS CONFIGURATION
// ==================================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://unidigitalcom-front-end.onrender.com',
  'https://unidigitalcom-admin.onrender.com',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    Logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ==================================================================
// 7. SECURITY MIDDLEWARE
// ==================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(securityHeaders);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression()); // Compress responses

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// ==================================================================
// 8. LOGGING MIDDLEWARE
// ==================================================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Create a write stream for access logs
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

app.use(Logger.request);

// ==================================================================
// 9. SESSION CONFIGURATION (for webhooks, OAuth, etc.)
// ==================================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'unidigital-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));

// ==================================================================
// 10. STATIC FILES
// ==================================================================
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==================================================================
// 11. RATE LIMITING
// ==================================================================
// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Stricter rate limiting for auth routes
app.use('/api/auth', authLimiter);

// ==================================================================
// 12. API ROUTES
// ==================================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Webhook routes (no rate limiting, needs raw body)
app.use('/webhooks', webhookRoutes);

// ==================================================================
// 13. PAYPAL ENDPOINTS (Enhanced with better error handling)
// ==================================================================

// Create PayPal order
app.post('/api/create-paypal-order', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ 
        success: false, 
        error: 'PayPal service unavailable',
        message: 'Payment processing is temporarily unavailable'
      });
    }

    const { amount, currency = 'USD', items, description, orderId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');

    const orderBody = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: parseFloat(amount).toFixed(2)
        },
        description: description || 'UniDigital Marketplace Purchase',
        custom_id: orderId || `order_${Date.now()}`
      }],
      application_context: {
        brand_name: 'UniDigital Marketplace',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: process.env.PAYPAL_RETURN_URL || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: process.env.PAYPAL_CANCEL_URL || `${process.env.FRONTEND_URL}/payment/cancel`
      }
    };

    // Add items if provided
    if (items && items.length > 0) {
      orderBody.purchase_units[0].items = items.map(item => ({
        name: item.name.substring(0, 127),
        unit_amount: { 
          currency_code: currency, 
          value: parseFloat(item.price).toFixed(2) 
        },
        quantity: item.quantity.toString(),
        description: item.description?.substring(0, 127) || '',
        category: 'DIGITAL_GOODS'
      }));

      // Calculate total from items
      const total = items.reduce((sum, item) => 
        sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
      ).toFixed(2);
      
      orderBody.purchase_units[0].amount.breakdown = {
        item_total: {
          currency_code: currency,
          value: total
        }
      };
    }

    request.requestBody(orderBody);
    const order = await paypalClient.execute(request);

    Logger.info(`✅ PayPal order created: ${order.result.id}`, {
      orderId: order.result.id,
      amount,
      currency
    });

    res.status(201).json({ 
      success: true, 
      orderID: order.result.id, 
      status: order.result.status,
      links: order.result.links 
    });

  } catch (error) {
    Logger.error('❌ PayPal order creation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: 'Failed to create PayPal order',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing error'
    });
  }
});

// Capture PayPal order
app.post('/api/capture-paypal-order', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ 
        success: false, 
        error: 'PayPal service unavailable'
      });
    }

    const { orderID } = req.body;
    if (!orderID) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order ID is required' 
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    const capture = await paypalClient.execute(request);

    Logger.info(`✅ PayPal order captured: ${capture.result.id}`);

    const captureInfo = capture.result.purchase_units[0].payments.captures[0];
    
    res.status(200).json({
      success: true,
      transactionID: capture.result.id,
      status: capture.result.status,
      amount: captureInfo.amount.value,
      currency: captureInfo.amount.currency_code,
      payer: capture.result.payer,
      create_time: capture.result.create_time,
      update_time: capture.result.update_time
    });

  } catch (error) {
    Logger.error('❌ PayPal capture error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: 'Failed to capture payment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Payment capture failed'
    });
  }
});

// ==================================================================
// 14. HEALTH CHECK ROUTES (Enhanced with email verification status)
// ==================================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      paypal: paypalClient ? 'connected' : 'disconnected',
      email: process.env.SENDGRID_API_KEY ? 'configured' : 'not configured'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Unidigitalcom Backend API',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: {
      authentication: {
        emailVerification: true,
        passwordReset: true,
        twoFactor: false
      },
      payments: {
        paypal: paypalClient ? 'connected' : 'disconnected',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured'
      },
      email: process.env.SENDGRID_API_KEY ? 'configured' : 'not configured',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

// ==================================================================
// 15. WELCOME ROUTES
// ==================================================================
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to UniDigitalcom API v2.0',
    version: '2.0.0',
    documentation: '/api/docs',
    features: [
      '✅ User Authentication with Email Verification',
      '✅ Product Management',
      '✅ Shopping Cart',
      '✅ Order Processing',
      '✅ PayPal Payment Integration',
      '✅ Real-time Market Data',
      '✅ AI Pricing Engine',
      '✅ Email Notifications'
    ],
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      admin: '/api/admin',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 UniDigital Backend API Server v2.0',
    version: '2.0.0',
    status: 'operational',
    features: {
      emailVerification: 'enabled',
      paypal: paypalClient ? 'connected' : 'disabled',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured'
    },
    documentation: '/api',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// ==================================================================
// 16. 404 HANDLER
// ==================================================================
app.use(notFound);

// ==================================================================
// 17. ERROR HANDLING MIDDLEWARE
// ==================================================================
app.use(errorHandler);

// ==================================================================
// 18. START SERVER
// ==================================================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 UniDigital Backend API v2.0`);
  console.log('='.repeat(60));
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Routes: http://localhost:${PORT}/api/auth`);
  console.log(`📧 Email Verification: ✅ Enabled`);
  console.log(`💳 PayPal: ${paypalClient ? '✅ Connected' : '❌ Disabled'}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log('='.repeat(60) + '\n');
  
  // Log to logger
  Logger.api(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  Logger.api(`📧 Email verification system active`);
});

// ==================================================================
// 19. GRACEFUL SHUTDOWN
// ==================================================================
process.on('unhandledRejection', (err) => {
  Logger.error('💥 Unhandled Rejection:', err);
  // Don't exit immediately, try to recover
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  Logger.error('💥 Uncaught Exception:', err);
  // Log and exit
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  Logger.warn('⚠️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    Logger.info('✅ Server closed. Process terminated.');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  Logger.warn('⚠️ SIGINT received. Shutting down gracefully...');
  server.close(() => {
    Logger.info('✅ Server closed. Process terminated.');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

// ==================================================================
// 20. EXPORT APP
// ==================================================================
module.exports = { app, server };