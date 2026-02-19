const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  // ============================================
  // SERVER CONFIGURATION
  // ============================================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',
  APP_NAME: process.env.APP_NAME || 'UniDigital Marketplace',
  APP_VERSION: process.env.APP_VERSION || '2.0.0',
  
  // API URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  
  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/unidigitalcom',
  DATABASE_NAME: process.env.DATABASE_NAME || 'unidigital_production',
  
  // MongoDB connection options
  MONGODB_OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
  
  // ============================================
  // JWT AUTHENTICATION
  // ============================================
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_change_in_production',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // ============================================
  // EMAIL VERIFICATION CONFIGURATION
  // ============================================
  // Nodemailer SMTP settings (Gmail)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  
  // Email sender details
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@unidigital.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'UniDigital Marketplace',
  
  // Email verification settings
  EMAIL_VERIFICATION_EXPIRY: process.env.EMAIL_VERIFICATION_EXPIRY || '24h', // Token expiration time
  EMAIL_VERIFICATION_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  EMAIL_RESEND_COOLDOWN: process.env.EMAIL_RESEND_COOLDOWN || '2m', // Minimum time between resend requests
  EMAIL_RESEND_COOLDOWN_MS: 2 * 60 * 1000, // 2 minutes in milliseconds
  
  // Email feature flags
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' || true,
  ENABLE_WELCOME_EMAIL: process.env.ENABLE_WELCOME_EMAIL === 'true' || true,
  
  // ============================================
  // SECURITY CONFIGURATION
  // ============================================
  SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_change_in_production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CSRF_SECRET: process.env.CSRF_SECRET || 'your_csrf_secret_change_in_production',
  
  // CORS allowed origins (array)
  CORS_ORIGINS: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  
  // ============================================
  // RATE LIMITING
  // ============================================
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // General API rate limit
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10, // Login attempts per window
  VERIFICATION_RATE_LIMIT_MAX: parseInt(process.env.VERIFICATION_RATE_LIMIT_MAX) || 3, // Email verification resend attempts
  
  // ============================================
  // PAYMENT CONFIGURATION
  // ============================================
  // PayPal
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox',
  PAYPAL_RETURN_URL: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
  PAYPAL_CANCEL_URL: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel',
  ENABLE_PAYPAL: process.env.ENABLE_PAYPAL === 'true' || false,
  
  // ============================================
  // AI PRICING ENGINE
  // ============================================
  ENABLE_AI_PRICING: process.env.ENABLE_AI_PRICING === 'true' || false,
  AI_PRICING_MODEL: process.env.AI_PRICING_MODEL || 'gpt-4',
  AI_PRICE_UPDATE_INTERVAL: parseInt(process.env.AI_PRICE_UPDATE_INTERVAL) || 3600000, // 1 hour
  
  // ============================================
  // LOGGING
  // ============================================
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // ============================================
  // PERFORMANCE
  // ============================================
  MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '10mb',
  COMPRESSION_THRESHOLD: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Check if email is configured properly
   * @returns {boolean} True if email is configured
   */
  isEmailConfigured() {
    return !!(this.SMTP_USER && this.SMTP_PASSWORD);
  },
  
  /**
   * Get email configuration for nodemailer
   * @returns {Object} Nodemailer configuration object
   */
  getEmailConfig() {
    return {
      host: this.SMTP_HOST,
      port: this.SMTP_PORT,
      secure: this.SMTP_SECURE,
      auth: {
        user: this.SMTP_USER,
        pass: this.SMTP_PASSWORD
      },
      // Add connection pool for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    };
  },
  
  /**
   * Check if running in production mode
   * @returns {boolean} True if in production
   */
  isProduction() {
    return this.NODE_ENV === 'production';
  },
  
  /**
   * Check if running in development mode
   * @returns {boolean} True if in development
   */
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },
  
  /**
   * Get allowed CORS origins
   * @returns {Array} Array of allowed origins
   */
  getAllowedOrigins() {
    const origins = [...this.CORS_ORIGINS];
    
    // Add localhost for development
    if (this.isDevelopment()) {
      origins.push('http://localhost:3000', 'http://localhost:3001');
    }
    
    return origins;
  }
};