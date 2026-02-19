const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // -------------------------------
  // Basic user info
  // -------------------------------
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    index: true // Add index for faster queries
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: { 
    type: String, 
    trim: true,
    default: ''
  },

  // -------------------------------
  // Avatar / Profile Picture
  // -------------------------------
  avatar: {
    type: String, // URL
    default: null
  },

  // -------------------------------
  // Address
  // -------------------------------
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, default: 'USA' },
    zipCode: { type: String, trim: true, default: '' }
  },

  // -------------------------------
  // Role & account status
  // -------------------------------
  role: {
    type: String,
    enum: ['customer', 'admin', 'vendor'],
    default: 'customer'
  },
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'deactivated'],
    default: 'pending' // Changed from 'active' to 'pending' to enforce verification
  },
  lastLogin: { type: Date },
  lastActive: { type: Date }, // Track user activity
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: { type: Date }, // For account locking after failed attempts

  // -------------------------------
  // Email verification
  // -------------------------------
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: { 
    type: String, 
    default: null,
    index: true // Add index for faster verification lookups
  },
  verificationExpires: { 
    type: Date, 
    default: null 
  },
  lastVerificationRequested: { 
    type: Date, 
    default: null 
  }, // Track when last verification email was sent (for rate limiting)

  // -------------------------------
  // Password reset
  // -------------------------------
  resetPasswordToken: { 
    type: String, 
    default: null,
    index: true
  },
  resetPasswordExpires: { 
    type: Date, 
    default: null 
  },
  lastPasswordChange: { 
    type: Date,
    default: null
  }, // Track when password was last changed

  // -------------------------------
  // Two-factor authentication (optional)
  // -------------------------------
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  backupCodes: [{
    type: String,
    select: false
  }],

  // -------------------------------
  // Preferences
  // -------------------------------
  preferences: {
    newsletter: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  },

  // -------------------------------
  // Relationships
  // -------------------------------
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  // -------------------------------
  // Metadata
  // -------------------------------
  lastLoginIP: { type: String },
  lastUserAgent: { type: String },
  signupIP: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For referral system
  tags: [{ type: String }] // For user segmentation/categorization

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      delete ret.verificationExpires;
      delete ret.twoFactorSecret;
      delete ret.backupCodes;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      delete ret.verificationExpires;
      delete ret.twoFactorSecret;
      delete ret.backupCodes;
      return ret;
    }
  }
});

// -------------------------------
// Indexes for better performance
// -------------------------------
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// -------------------------------
// Virtual for full name
// -------------------------------
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// -------------------------------
// Virtual for account lock status
// -------------------------------
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// -------------------------------
// Virtual for verification status
// -------------------------------
userSchema.virtual('verificationStatus').get(function() {
  if (this.isEmailVerified) return 'verified';
  if (this.verificationExpires && this.verificationExpires > Date.now()) return 'pending';
  if (this.verificationExpires && this.verificationExpires < Date.now()) return 'expired';
  return 'none';
});

// -------------------------------
// Hash password before saving
// -------------------------------
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update lastPasswordChange if password is modified
    if (this.isModified('password')) {
      this.lastPasswordChange = new Date();
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware to set default values
userSchema.pre('save', function(next) {
  // Set default account status to pending if email not verified
  if (!this.isEmailVerified && this.accountStatus === 'active') {
    this.accountStatus = 'pending';
  }
  
  // Set account to active if email verified and status is pending
  if (this.isEmailVerified && this.accountStatus === 'pending') {
    this.accountStatus = 'active';
  }
  
  next();
});

// -------------------------------
// Compare password
// -------------------------------
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// -------------------------------
// Generate email verification token
// -------------------------------
userSchema.methods.generateVerificationToken = function() {
  // Clear any existing token first
  this.verificationToken = null;
  this.verificationExpires = null;
  
  // Generate new token
  const token = crypto.randomBytes(32).toString('hex'); // Increased from 20 to 32 bytes for better security
  this.verificationToken = token;
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  this.lastVerificationRequested = new Date();
  
  return token;
};

// -------------------------------
// Generate password reset token
// -------------------------------
userSchema.methods.generateResetToken = function() {
  // Clear any existing token
  this.resetPasswordToken = null;
  this.resetPasswordExpires = null;
  
  // Generate new token
  const token = crypto.randomBytes(32).toString('hex'); // Increased for better security
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
  return token;
};

// -------------------------------
// Check if verification token is valid
// -------------------------------
userSchema.methods.isVerificationTokenValid = function(token) {
  return this.verificationToken === token && 
         this.verificationExpires && 
         this.verificationExpires > Date.now();
};

// -------------------------------
// Check if reset token is valid
// -------------------------------
userSchema.methods.isResetTokenValid = function(token) {
  return this.resetPasswordToken === token && 
         this.resetPasswordExpires && 
         this.resetPasswordExpires > Date.now();
};

// -------------------------------
// Increment login attempts (for rate limiting)
// -------------------------------
userSchema.methods.incrementLoginAttempts = function() {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts and it's not locked already
  const maxAttempts = 5;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    const lockTime = 30 * 60 * 1000; // 30 minutes
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// -------------------------------
// Record successful login
// -------------------------------
userSchema.methods.recordLogin = function(ip, userAgent) {
  this.lastLogin = new Date();
  this.lastActive = new Date();
  this.lastLoginIP = ip;
  this.lastUserAgent = userAgent;
  this.loginAttempts = 0; // Reset login attempts on successful login
  this.lockUntil = undefined; // Remove any lock
  return this.save();
};

// -------------------------------
// Check if user can request verification again (rate limiting)
// -------------------------------
userSchema.methods.canRequestVerification = function() {
  if (!this.lastVerificationRequested) return true;
  
  const minInterval = 2 * 60 * 1000; // 2 minutes
  const timeSinceLastRequest = Date.now() - this.lastVerificationRequested;
  
  return timeSinceLastRequest >= minInterval;
};

// -------------------------------
// Static method to find by token (useful for verification)
// -------------------------------
userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() }
  });
};

// -------------------------------
// Static method to find by reset token
// -------------------------------
userSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
};

// -------------------------------
// Static method to cleanup expired tokens (could be run by a cron job)
// -------------------------------
userSchema.statics.cleanupExpiredTokens = function() {
  return this.updateMany(
    {
      $or: [
        { verificationExpires: { $lt: Date.now() } },
        { resetPasswordExpires: { $lt: Date.now() } }
      ]
    },
    {
      $unset: {
        verificationToken: 1,
        verificationExpires: 1,
        resetPasswordToken: 1,
        resetPasswordExpires: 1
      }
    }
  );
};

// -------------------------------
// Export User model
// -------------------------------
module.exports = mongoose.model('User', userSchema);