const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// ------------------------------------------------------------------
// CONTROLLER IMPORTS
// ------------------------------------------------------------------
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  logoutUser
} = require('../controllers/authController');

// ------------------------------------------------------------------
// MIDDLEWARE IMPORTS
// ------------------------------------------------------------------
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { multer } = require('../middleware/uploadMiddleware');

// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------
const checkPasswordStrength = (password) => {
  if (password.length < 8) return 'weak';
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
  return 'medium';
};

const getPasswordSuggestions = (password) => {
  const suggestions = [];
  if (password.length < 8) suggestions.push('Use at least 8 characters');
  if (!/[A-Z]/.test(password)) suggestions.push('Add at least one uppercase letter');
  if (!/[a-z]/.test(password)) suggestions.push('Add at least one lowercase letter');
  if (!/[0-9]/.test(password)) suggestions.push('Add at least one number');
  if (!/[@$!%*?&]/.test(password)) suggestions.push('Add at least one special character (@$!%*?&)');
  return suggestions;
};

// ------------------------------------------------------------------
// VALIDATION RULES
// ------------------------------------------------------------------
const registerValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'.]+$/).withMessage('First name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s\-'.]*$/).withMessage('Last name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('email')
    .isEmail().withMessage('Please include a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email must be less than 100 characters'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      const strength = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('Password is too weak. Use at least 8 characters with uppercase letters and numbers');
      }
      return true;
    }),

  body('acceptTerms')
    .equals('true').withMessage('You must accept the terms and conditions')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please include a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('rememberMe')
    .optional()
    .isBoolean().withMessage('Remember me must be true or false')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Please include a valid email address')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      const strength = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('Password is too weak. Use at least 8 characters with uppercase letters and numbers');
      }
      return true;
    })
];

const resendVerificationValidation = [
  body('email')
    .isEmail().withMessage('Please include a valid email address')
    .normalizeEmail()
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'.]+$/).withMessage('First name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s\-'.]*$/).withMessage('Last name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('email')
    .optional()
    .isEmail().withMessage('Please include a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please include a valid phone number')
    .trim(),

  body('market')
    .optional()
    .isIn(['US', 'GB', 'CN', 'JP', 'EU', 'AU', 'CA', 'global'])
    .withMessage('Invalid market selection'),

  body('preferences.currency')
    .optional()
    .isIn(['USD', 'GBP', 'EUR', 'JPY', 'CNY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),

  body('preferences.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh', 'ja'])
    .withMessage('Invalid language'),

  body('preferences.notifications')
    .optional()
    .isBoolean().withMessage('Notifications must be true or false')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      const strength = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('Password is too weak. Use at least 8 characters with uppercase letters and numbers');
      }
      return true;
    }),

  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

const deleteAccountValidation = [
  body('password')
    .notEmpty().withMessage('Password is required to delete your account')
];

// ------------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------------
router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword);
router.post('/resend-verification', resendVerificationValidation, validate, resendVerification);
router.get('/verify-email/:token', verifyEmail);

// Demo account endpoint (optional)
router.post('/demo-login', (req, res) => {
  const demoAccount = {
    token: 'demo_jwt_token_' + Date.now(),
    user: {
      id: 'demo_user_id',
      name: 'Demo User',
      email: 'test@example.com',
      role: 'user',
      isVerified: true,
      market: 'US',
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: true
      },
      stats: {
        totalOrders: 5,
        totalSpent: 2500
      }
    }
  };
  res.json({
    success: true,
    message: 'Demo login successful',
    token: demoAccount.token,
    tokenExpiry: '90d',
    user: demoAccount.user
  });
});

// Password strength check endpoint
router.post('/check-password-strength', [
  body('password').notEmpty().withMessage('Password is required')
], validate, (req, res) => {
  const { password } = req.body;
  const strength = checkPasswordStrength(password);
  const suggestions = getPasswordSuggestions(password);
  res.json({
    success: true,
    strength,
    score: strength === 'weak' ? 1 : strength === 'medium' ? 2 : 3,
    suggestions
  });
});

// Email validation endpoint
router.post('/validate-email', [
  body('email').isEmail().withMessage('Please include a valid email address')
], validate, async (req, res) => {
  const { email } = req.body;
  // Replace with actual DB check if needed
  const emailExists = false;
  res.json({
    success: true,
    isValid: true,
    isAvailable: !emailExists,
    message: emailExists ? 'Email is already registered' : 'Email is available'
  });
});

// Statistics endpoint
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    products: 50000,
    accuracy: 98.7,
    support: '24/7',
    users: 150000,
    countries: 150,
    satisfaction: 96.5
  });
});

// Terms and Privacy endpoints
router.get('/terms', (req, res) => {
  res.json({
    success: true,
    title: 'Terms of Service',
    content: 'Terms of Service content here...',
    lastUpdated: new Date().toISOString()
  });
});

router.get('/privacy', (req, res) => {
  res.json({
    success: true,
    title: 'Privacy Policy',
    content: 'Privacy Policy content here...',
    lastUpdated: new Date().toISOString()
  });
});

// Contact/Help endpoint
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], validate, (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact form submission:', { name, email, message });
  res.json({
    success: true,
    message: 'Thank you for your message. We will respond within 24 hours.'
  });
});

// Get market-specific features
router.get('/features', (req, res) => {
  const features = [
    { icon: '🤖', title: 'AI-Powered Pricing', description: 'Real-time market analysis for the best prices' },
    { icon: '🌍', title: 'Global Marketplace', description: 'Shop from verified sellers worldwide' },
    { icon: '🛡️', title: 'Secure Transactions', description: 'Protected payments and buyer guarantees' },
    { icon: '🚚', title: 'Fast Shipping', description: 'International delivery with tracking' },
    { icon: '💳', title: 'Multiple Payment Options', description: 'PayPal, Credit Cards, Apple Pay, and more' },
    { icon: '📊', title: 'Market Insights', description: 'AI-driven analytics and price trends' }
  ];
  res.json({ success: true, features });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ------------------------------------------------------------------
// OAUTH ROUTES (stubs – implement fully later)
// ------------------------------------------------------------------
router.get('/google', (req, res) => {
  res.status(501).json({ success: false, message: 'Google OAuth not implemented yet' });
});

router.get('/google/callback', (req, res) => {
  res.status(501).json({ success: false, message: 'Google OAuth callback not implemented' });
});

router.get('/apple', (req, res) => {
  res.status(501).json({ success: false, message: 'Apple OAuth not implemented yet' });
});

router.get('/apple/callback', (req, res) => {
  res.status(501).json({ success: false, message: 'Apple OAuth callback not implemented' });
});

// ------------------------------------------------------------------
// PROTECTED ROUTES (require authentication)
// ------------------------------------------------------------------
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/upload-avatar', protect, multer.single('avatar'), uploadAvatar);
router.post('/logout', protect, logoutUser);
router.delete('/delete-account', protect, deleteAccountValidation, validate, deleteAccount);

module.exports = router;