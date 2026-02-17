const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendEmail, sendVerificationEmail, sendWelcomeEmail } = require('../utils/email'); 

// ------------------------------------------------------------------
// Generate JWT Token
// ------------------------------------------------------------------
const generateToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe ? '90d' : '30d';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// ------------------------------------------------------------------
// REGISTER, LOGIN, VERIFY, PASSWORD CONTROLLERS
// ------------------------------------------------------------------
// ... (your existing registerUser, loginUser, verifyEmail, resendVerification, forgotPassword, resetPassword, getMe, updateProfile, changePassword)
// (keep exactly as in your previous code)

// ------------------------------------------------------------------
// UPLOAD AVATAR
// ------------------------------------------------------------------
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlink(oldAvatarPath, (err) => {
          if (err) console.error('❌ Failed to delete old avatar:', err);
        });
      }
    }

    // Save new avatar path
    user.avatar = `uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload avatar', error: error.message });
  }
};

// ------------------------------------------------------------------
// LOGOUT & DELETE ACCOUNT
// ------------------------------------------------------------------
const logoutUser = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { password } = req.body;
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Password incorrect' });

    // Delete avatar file if exists
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
  }
};

// ------------------------------------------------------------------
// EXPORT ALL CONTROLLERS
// ------------------------------------------------------------------
module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,       // ✅ Added
  deleteAccount,
  logoutUser,
  generateToken
};
