const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// ------------------------------------------------------------------
// Generate JWT Token
// ------------------------------------------------------------------
const generateToken = (id, market = 'US', rememberMe = false) => {
  const expiresIn = rememberMe ? '90d' : '30d';
  return jwt.sign({ id, market }, process.env.JWT_SECRET, { expiresIn });
};

// ------------------------------------------------------------------
// SendGrid configuration
// ------------------------------------------------------------------
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper to send emails using SendGrid
const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || 'UniDigital Marketplace',
    },
    subject,
    html,
  };
  await sgMail.send(msg);
};

// ------------------------------------------------------------------
// @desc    Register user with market preference
// @route   POST /api/auth/register
// @access  Public
// ------------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { 
      firstName,
      lastName,
      email, 
      password, 
      phone, 
      market = 'US',
      acceptTerms 
    } = req.body;

    if (!acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions'
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      phone,
      market,
      preferences: {
        currency: market === 'GB' ? 'GBP' : market === 'JP' ? 'JPY' : market === 'CN' ? 'CNY' : 'USD',
        language: 'en',
        notifications: true
      }
    });

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email using SendGrid
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - UniDigital Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #2563eb;">Welcome to UniDigital Marketplace!</h2>
            <p>Hello <strong>${firstName}</strong>,</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: #666;">This link will expire in 24 hours.</p>
            <p style="color: #666;">If you didn't create an account, you can ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              UniDigital Marketplace – Global Tech & Automotive
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // User still created, continue
    }

    const token = generateToken(user._id, market);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        market: user.market,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ------------------------------------------------------------------
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password, market = 'US', rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: user.isLocked 
          ? 'Account locked due to too many failed attempts. Try again in 30 minutes.'
          : 'Invalid email or password',
        attemptsRemaining: 5 - (user.failedLoginAttempts || 0)
      });
    }

    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.market = market;
    await user.save();

    const token = generateToken(user._id, market, rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        market: user.market,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        cart: user.cart || { items: [], total: 0 },
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ------------------------------------------------------------------
// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
// ------------------------------------------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
// ------------------------------------------------------------------
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - UniDigital Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb;">Verify Your Email</h2>
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600;">
            Verify Email
          </a>
          <p style="color: #666;">This link will expire in 24 hours.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
// ------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - UniDigital Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2563eb;">Reset Your Password</h2>
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600;">
            Reset Password
          </a>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ------------------------------------------------------------------
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist')
      .populate({ path: 'cart.items.product', model: 'Product', select: 'name price image market' })
      .populate('orders')
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        market: user.market,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        address: user.address,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        cart: user.cart || { items: [], total: 0 },
        wishlist: user.wishlist || [],
        orders: user.orders || [],
        stats: {
          totalOrders: user.orders?.length || 0,
          totalSpent: user.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
// ------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, market, preferences } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (market) updateData.market = market;
    if (preferences) updateData.preferences = { ...preferences };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ------------------------------------------------------------------
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ------------------------------------------------------------------
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // Optional: send notification using SendGrid
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Changed - UniDigital Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #2563eb;">Password Changed Successfully</h2>
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>Your password was changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
            <p style="color: #666;">If you didn't make this change, please contact support immediately.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Password change email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Upload profile picture
// @route   POST /api/auth/upload-avatar
// @access  Private
// ------------------------------------------------------------------
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true }).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Delete account (soft delete)
// @route   DELETE /api/auth/delete-account
// @access  Private
// ------------------------------------------------------------------
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// ------------------------------------------------------------------
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ------------------------------------------------------------------
const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

// ------------------------------------------------------------------
// ✅ EXPORT ALL CONTROLLER FUNCTIONS
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
  uploadAvatar,
  deleteAccount,
  logoutUser,
  generateToken
};