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
const multer = require('../middleware/uploadMiddleware'); // Fixed destructuring

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
  body('firstName').notEmpty().withMessage('First name is required').trim().isLength({ min: 2, max: 50 }),
  body('lastName').notEmpty().withMessage('Last name is required').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((value) => {
      if (checkPasswordStrength(value) === 'weak') throw new Error('Password too weak');
      return true;
    }),
  body('acceptTerms').equals('true').withMessage('Terms must be accepted')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
  body('rememberMe').optional().isBoolean().withMessage('Remember me must be true/false')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail()
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((value) => {
      if (checkPasswordStrength(value) === 'weak') throw new Error('Password too weak');
      return true;
    })
];

const resendVerificationValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail()
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) throw new Error('New password must differ');
      if (checkPasswordStrength(value) === 'weak') throw new Error('Password too weak');
      return true;
    }),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  })
];

const deleteAccountValidation = [
  body('password').notEmpty().withMessage('Password required to delete account')
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

// Password strength check
router.post('/check-password-strength', [
  body('password').notEmpty().withMessage('Password required')
], validate, (req, res) => {
  const { password } = req.body;
  const strength = checkPasswordStrength(password);
  const suggestions = getPasswordSuggestions(password);
  res.json({ success: true, strength, suggestions });
});

// ------------------------------------------------------------------
// PROTECTED ROUTES
// ------------------------------------------------------------------
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/upload-avatar', protect, multer.single('avatar'), uploadAvatar);
router.post('/logout', protect, logoutUser);
router.delete('/delete-account', protect, deleteAccountValidation, validate, deleteAccount);

module.exports = router;