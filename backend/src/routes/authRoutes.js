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
  logoutUser
} = authController;

// ------------------------------------------------------------------
// MIDDLEWARE IMPORTS
// ------------------------------------------------------------------
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware'); // multer

// ------------------------------------------------------------------
// SAFETY CHECK (prevents undefined controllers)
// ------------------------------------------------------------------
const ensure = (fn, name) => {
  if (typeof fn !== 'function') {
    throw new Error(`❌ Controller "${name}" is not defined or not exported`);
  }
  return fn;
};

// ------------------------------------------------------------------
// PASSWORD STRENGTH CHECK
// ------------------------------------------------------------------
const checkPasswordStrength = (password) => {
  if (!password || password.length < 8) return 'weak';
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
  return 'medium';
};

// ------------------------------------------------------------------
// VALIDATION RULES
// ------------------------------------------------------------------
const registerValidation = [
  body('firstName').notEmpty().isLength({ min: 2, max: 50 }),
  body('lastName').notEmpty().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .custom((value) => {
      if (checkPasswordStrength(value) === 'weak') throw new Error('Password too weak');
      return true;
    }),
  body('acceptTerms').equals('true')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const forgotPasswordValidation = [body('email').isEmail().normalizeEmail()];

const resetPasswordValidation = [body('password').isLength({ min: 6 })];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  })
];

const deleteAccountValidation = [body('password').notEmpty()];

// ------------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------------
router.post('/register', registerValidation, validate, ensure(registerUser, 'registerUser'));
router.post('/login', loginValidation, validate, ensure(loginUser, 'loginUser'));
router.post('/forgot-password', forgotPasswordValidation, validate, ensure(forgotPassword, 'forgotPassword'));
router.post('/reset-password/:token', resetPasswordValidation, validate, ensure(resetPassword, 'resetPassword'));
router.post('/resend-verification', validate, ensure(resendVerification, 'resendVerification'));
router.get('/verify-email/:token', ensure(verifyEmail, 'verifyEmail'));

router.post('/check-password-strength', body('password').notEmpty(), validate, (req, res) => {
  const strength = checkPasswordStrength(req.body.password);
  res.json({ success: true, strength });
});

// ------------------------------------------------------------------
// PROTECTED ROUTES
// ------------------------------------------------------------------
router.get('/me', protect, ensure(getMe, 'getMe'));
router.put('/update-profile', protect, validate, ensure(updateProfile, 'updateProfile'));
router.put('/change-password', protect, changePasswordValidation, validate, ensure(changePassword, 'changePassword'));

// ✅ AVATAR UPLOAD
router.post('/upload-avatar', protect, upload.uploadSingle('avatar'), ensure(uploadAvatar, 'uploadAvatar'));

router.post('/logout', protect, ensure(logoutUser, 'logoutUser'));
router.delete('/delete-account', protect, deleteAccountValidation, validate, ensure(deleteAccount, 'deleteAccount'));

module.exports = router;
