const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // -------------------------------
  // Basic user info
  // -------------------------------
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String, // URL of profile picture
    default: null
  },
  // -------------------------------
  // Address
  // -------------------------------
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'USA' },
    zipCode: { type: String, trim: true }
  },
  // -------------------------------
  // Role & status
  // -------------------------------
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  // -------------------------------
  // Email verification
  // -------------------------------
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  // -------------------------------
  // Password reset
  // -------------------------------
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // -------------------------------
  // Relationships
  // -------------------------------
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// -------------------------------
// Hash password before saving
// -------------------------------
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// -------------------------------
// Compare password method
// -------------------------------
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// -------------------------------
// Remove sensitive data when converting to JSON
// -------------------------------
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.verificationToken;
  delete user.verificationExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);