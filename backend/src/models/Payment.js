const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Core References
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    required: true,
    enum: [
      // Aligned with frontend PaymentGateway
      'card', 'paypal', 'applepay', 'googlepay', 'bank', 
      'crypto', 'klarna', 'alipay', 'wechat', 'union',
      'paypay', 'linepay'
    ]
  },
  gateway: {
    type: String,
    required: true,
    enum: ['paypal', 'stripe', 'razorpay', 'alipay', 'paypay', 'manual', 'other'],
    default: 'manual'
  },
  gatewayOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  gatewayTransactionId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    set: v => parseFloat(v.toFixed(2))
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'GBP', 'EUR', 'AED', 'AUD', 'CAD', 'JPY', 'CNY'],
    default: 'GBP'
  },
  market: {
    type: String,
    enum: ['GB', 'US', 'EU', 'AE', 'AU', 'CA', 'JP', 'CN', 'global'],
    default: 'GB',
    index: true
  },
  
  // Fee Breakdown
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shippingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  gatewayFee: {
    percentage: { type: Number, default: 0 },
    fixed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Status & Timeline
  status: {
    type: String,
    enum: [
      'pending',           // Payment created, awaiting user action
      'processing',        // Payment submitted to gateway
      'authorized',        // Payment authorized but not captured
      'capturing',         // Capture initiated
      'completed',         // Payment successfully completed
      'failed',            // Payment failed
      'cancelled',         // Payment cancelled by user
      'refunded',          // Fully refunded
      'partially_refunded', // Partially refunded
      'disputed',          // Payment disputed
      'chargeback'         // Chargeback initiated
    ],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    performedBy: {
      type: String,
      enum: ['system', 'user', 'admin', 'gateway']
    }
  }],
  
  // Gateway Data
  gatewayData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // PayPal Specific
  paypalData: {
    orderId: String,
    payerId: String,
    payerEmail: String,
    payerName: String,
    captureId: String,
    refundId: String,
    links: [{
      href: String,
      rel: String,
      method: String
    }]
  },
  
  // Card Details (if applicable, masked for security)
  cardDetails: {
    lastFour: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    country: String,
    funding: String // credit, debit, prepaid
  },
  
  // Bank Transfer Details
  bankTransfer: {
    bankName: String,
    accountName: String,
    accountLastFour: String,
    referenceNumber: String,
    iban: String,
    swiftCode: String
  },
  
  // Wallet Details (Apple Pay, Google Pay, etc.)
  walletDetails: {
    walletId: String,
    walletType: String,
    phoneNumber: String,
    email: String
  },
  
  // Billing Information
  billingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    countryCode: String,
    phone: String,
    email: String
  },
  
  // Refund Information
  refunds: [{
    amount: Number,
    currency: String,
    reason: String,
    status: String,
    gatewayRefundId: String,
    processedAt: Date,
    processedBy: mongoose.Schema.Types.ObjectId,
    notes: String
  }],
  totalRefunded: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  
  // Failure Information
  failure: {
    code: String,
    message: String,
    reason: String,
    gatewayMessage: String,
    failedAt: Date,
    retryCount: { type: Number, default: 0 }
  },
  
  // Security
  ipAddress: String,
  userAgent: String,
  
  // Metadata
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net amount (amount after fees)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.gatewayFee.total;
});

// Virtual for isRefundable (90-day refund window)
paymentSchema.virtual('isRefundable').get(function() {
  if (this.status !== 'completed') return false;
  if (this.totalRefunded >= this.amount) return false;
  
  // Check if within 90 days
  const completedDate = this.paidAt || this.updatedAt;
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return completedDate >= ninetyDaysAgo;
});

// Virtual for refundableAmount
paymentSchema.virtual('refundableAmount').get(function() {
  return this.amount - this.totalRefunded;
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate transaction ID if not present
  if (!this.gatewayTransactionId && this.status === 'completed') {
    const prefix = this.gateway.toUpperCase().substring(0, 3);
    this.gatewayTransactionId = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Update status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      performedBy: 'system',
      reason: this.failure?.reason || 'Status updated'
    });
  }
  
  // Calculate total if not set (aligned with frontend calculation)
  if (this.isModified('subtotal') || this.isModified('taxAmount') || 
      this.isModified('shippingAmount') || this.isModified('discountAmount')) {
    const vatRate = 0.2; // 20% VAT as in frontend
    const subtotalWithTax = this.subtotal * (1 + vatRate);
    this.amount = subtotalWithTax + this.shippingAmount - this.discountAmount;
  }
  
  // Calculate gateway fees
  if (this.isModified('amount') || this.isModified('paymentMethod') || this.isModified('market')) {
    this.calculateGatewayFee();
  }
  
  next();
});

// Methods
paymentSchema.methods.getSummary = function() {
  return {
    paymentId: this._id,
    transactionId: this.gatewayTransactionId,
    amount: this.amount,
    currency: this.currency,
    market: this.market,
    paymentMethod: this.paymentMethod,
    gateway: this.gateway,
    status: this.status,
    createdAt: this.createdAt,
    completedAt: this.completedAt,
    isRefundable: this.isRefundable,
    refundableAmount: this.refundableAmount,
    netAmount: this.netAmount
  };
};

paymentSchema.methods.calculateGatewayFee = function() {
  // Fee rates aligned with frontend market support
  const feeRates = {
    'GB': {
      'card': { percentage: 2.9, fixed: 0.30 },
      'paypal': { percentage: 3.4, fixed: 0.35 },
      'applepay': { percentage: 2.5, fixed: 0.25 },
      'googlepay': { percentage: 2.5, fixed: 0.25 },
      'bank': { percentage: 0, fixed: 0 }
    },
    'US': {
      'card': { percentage: 2.9, fixed: 0.30 },
      'paypal': { percentage: 2.9, fixed: 0.30 },
      'crypto': { percentage: 1.0, fixed: 0 },
      'klarna': { percentage: 3.0, fixed: 0.30 }
    },
    'CN': {
      'alipay': { percentage: 1.5, fixed: 0.15 },
      'wechat': { percentage: 1.5, fixed: 0.15 },
      'union': { percentage: 2.0, fixed: 0.20 }
    },
    'JP': {
      'card': { percentage: 3.5, fixed: 0.35 },
      'paypay': { percentage: 1.9, fixed: 0.20 },
      'linepay': { percentage: 2.0, fixed: 0.20 }
    }
  };
  
  const marketRates = feeRates[this.market] || feeRates['GB'];
  const methodRate = marketRates[this.paymentMethod] || { percentage: 2.9, fixed: 0.30 };
  
  const feeTotal = (this.amount * (methodRate.percentage / 100)) + methodRate.fixed;
  
  this.gatewayFee = {
    percentage: methodRate.percentage,
    fixed: methodRate.fixed,
    total: parseFloat(feeTotal.toFixed(2))
  };
  
  return this.gatewayFee.total;
};

paymentSchema.methods.initiateRefund = async function(refundData) {
  if (!this.isRefundable) {
    throw new Error('Payment is not refundable');
  }
  
  if (refundData.amount > this.refundableAmount) {
    throw new Error(`Maximum refundable amount is ${this.refundableAmount}`);
  }
  
  this.refunds.push({
    ...refundData,
    status: 'pending',
    processedAt: new Date()
  });
  
  this.totalRefunded += refundData.amount;
  
  if (this.totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Static Methods
paymentSchema.statics.findByGatewayOrderId = function(gatewayOrderId) {
  return this.findOne({ gatewayOrderId });
};

paymentSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ gatewayTransactionId: transactionId });
};

paymentSchema.statics.getUserPayments = function(userId, options = {}) {
  const { limit = 20, page = 1, status, market, paymentMethod } = options;
  
  const query = { user: userId };
  if (status) query.status = status;
  if (market) query.market = market;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('order', 'orderNumber items total');
};

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ market: 1, status: 1 });
paymentSchema.index({ paymentMethod: 1, createdAt: -1 });
paymentSchema.index({ 'paypalData.orderId': 1 }, { sparse: true });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);