const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendEmail, sendVerificationEmail, sendWelcomeEmail } = require('../utils/email'); // Updated email module

// ------------------------------------------------------------------
// Generate JWT Token
// ------------------------------------------------------------------
const generateToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe ? '90d' : '30d';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// ------------------------------------------------------------------
// REGISTER USER
// ------------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { firstName, lastName, email, password, phone, acceptTerms } = req.body;

    if (!acceptTerms) return res.status(400).json({ success: false, message: 'You must accept the terms and conditions' });

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      accountStatus: 'active',
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.isEmailVerified = false;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);
    await sendWelcomeEmail(user); // Optional: send welcome email after registration

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// ------------------------------------------------------------------
// LOGIN USER
// ------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isEmailVerified) return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    if (user.accountStatus !== 'active') return res.status(403).json({ success: false, message: 'Account not active. Contact support.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// ------------------------------------------------------------------
// VERIFY EMAIL
// ------------------------------------------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ success: false, message: 'Email verification failed', error: error.message });
  }
};

// ------------------------------------------------------------------
// RESEND VERIFICATION EMAIL
// ------------------------------------------------------------------
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    await sendVerificationEmail(user, verificationToken);

    res.json({ success: true, message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification email', error: error.message });
  }
};

// ------------------------------------------------------------------
// FORGOT PASSWORD
// ------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - UniDigital Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2>Reset Your Password</h2>
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Click below to reset your password:</p>
          <a href="${resetUrl}" style="background:#2563eb; color:white; padding:12px 24px; text-decoration:none; border-radius:8px;">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password reset', error: error.message });
  }
};

// ------------------------------------------------------------------
// RESET PASSWORD
// ------------------------------------------------------------------
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

// ------------------------------------------------------------------
// GET CURRENT USER PROFILE
// ------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationExpires');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

// ------------------------------------------------------------------
// UPDATE PROFILE
// ------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// ------------------------------------------------------------------
// CHANGE PASSWORD
// ------------------------------------------------------------------
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    if (currentPassword === newPassword) return res.status(400).json({ success: false, message: 'New password must differ' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
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
  generateToken
};