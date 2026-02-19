const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// ------------------------------------------------------------------
// CONTROLLER IMPORTS
// ------------------------------------------------------------------
const authController = require('../controllers/authController');

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
  logoutUser,
  checkAuthStatus
} = authController;

// ------------------------------------------------------------------
// MIDDLEWARE IMPORTS
// ------------------------------------------------------------------
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware'); // multer
const { rateLimiter } = require('../middleware/rateLimiter');

// ------------------------------------------------------------------
// SAFETY CHECK (prevents undefined controllers)
// ------------------------------------------------------------------
const ensure = (fn, name) => {
  if (typeof fn !== 'function') {
    console.error(`❌ Controller "${name}" is not defined or not exported`);
    throw new Error(`Controller "${name}" is not defined or not exported`);
  }
  return fn;
};

// ------------------------------------------------------------------
// PASSWORD STRENGTH CHECK
// ------------------------------------------------------------------
const checkPasswordStrength = (password) => {
  if (!password || password.length < 8) return { strength: 'weak', score: 0 };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  let strength = 'weak';
  if (score >= 3) strength = 'medium';
  if (score >= 4) strength = 'strong';
  if (score >= 5) strength = 'very strong';
  
  return { strength, score };
};

// ------------------------------------------------------------------
// VALIDATION RULES
// ------------------------------------------------------------------
const registerValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((value) => {
      const { strength } = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('Password is too weak. Use a mix of uppercase, numbers, and special characters');
      }
      return true;
    }),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  body('acceptTerms')
    .equals('true').withMessage('You must accept the terms and conditions')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('rememberMe')
    .optional()
    .isBoolean().withMessage('Remember me must be a boolean')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((value) => {
      const { strength } = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('Password is too weak. Use a mix of uppercase, numbers, and special characters');
      }
      return true;
    })
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      const { strength } = checkPasswordStrength(value);
      if (strength === 'weak') {
        throw new Error('New password is too weak. Use a mix of uppercase, numbers, and special characters');
      }
      return true;
    }),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const deleteAccountValidation = [
  body('password')
    .notEmpty().withMessage('Password is required to delete account')
];

const resendVerificationValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase()
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .escape(),
  body('address.city')
    .optional()
    .trim()
    .escape(),
  body('address.state')
    .optional()
    .trim()
    .escape(),
  body('address.country')
    .optional()
    .trim()
    .escape(),
  body('address.zipCode')
    .optional()
    .trim()
    .escape()
];

// ------------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------------

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register', 
  registerValidation, 
  validate, 
  ensure(registerUser, 'registerUser')
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login', 
  loginValidation, 
  validate, 
  ensure(loginUser, 'loginUser')
);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email with token
// @access  Public
router.get(
  '/verify-email/:token', 
  ensure(verifyEmail, 'verifyEmail')
);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public (with rate limiting)
router.post(
  '/resend-verification',
  resendVerificationValidation,
  validate,
  rateLimiter({ windowMs: 2 * 60 * 1000, max: 3 }), // 3 requests per 2 minutes
  ensure(resendVerification, 'resendVerification')
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password', 
  forgotPasswordValidation, 
  validate,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 requests per hour
  ensure(forgotPassword, 'forgotPassword')
);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password/:token', 
  resetPasswordValidation, 
  validate, 
  ensure(resetPassword, 'resetPassword')
);

// @route   POST /api/auth/check-password-strength
// @desc    Check password strength without registering
// @access  Public
router.post(
  '/check-password-strength', 
  body('password').notEmpty().withMessage('Password is required'),
  validate, 
  (req, res) => {
    const { strength, score } = checkPasswordStrength(req.body.password);
    res.json({ 
      success: true, 
      strength,
      score,
      message: `Password strength: ${strength}`
    });
  }
);

// ------------------------------------------------------------------
// PROTECTED ROUTES (require authentication)
// ------------------------------------------------------------------

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get(
  '/me', 
  protect, 
  ensure(getMe, 'getMe')
);

// @route   GET /api/auth/check-auth
// @desc    Check if user is authenticated and get basic info
// @access  Private
router.get(
  '/check-auth', 
  protect, 
  ensure(checkAuthStatus, 'checkAuthStatus')
);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put(
  '/update-profile', 
  protect, 
  updateProfileValidation,
  validate, 
  ensure(updateProfile, 'updateProfile')
);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password', 
  protect, 
  changePasswordValidation, 
  validate, 
  ensure(changePassword, 'changePassword')
);

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post(
  '/upload-avatar', 
  protect, 
  upload.uploadSingle('avatar'), 
  ensure(uploadAvatar, 'uploadAvatar')
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post(
  '/logout', 
  protect, 
  ensure(logoutUser, 'logoutUser')
);

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete(
  '/delete-account', 
  protect, 
  deleteAccountValidation, 
  validate, 
  ensure(deleteAccount, 'deleteAccount')
);

// ------------------------------------------------------------------
// HEALTH CHECK ROUTE (optional)
// ------------------------------------------------------------------
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are operational',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------------
// EXPORT ROUTER
// ------------------------------------------------------------------
module.exports = router;