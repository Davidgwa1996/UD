const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendEmail, sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');

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
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, acceptTerms } = req.body;
    
    if (!acceptTerms) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must accept the terms and conditions' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user with verification fields
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      accountStatus: 'pending', // Changed from 'active' to 'pending' until email verified
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Generate token (optional - user might need to verify first)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account. The verification link expires in 24 hours.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// VERIFY EMAIL
// ------------------------------------------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    // Find user with valid token
    const user = await User.findOne({ 
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.accountStatus = 'active'; // Activate account after verification
    await user.save();

    // Send welcome email (don't await - fire and forget)
    sendWelcomeEmail(user).catch(err => 
      console.error('❌ Failed to send welcome email:', err)
    );

    res.json({ 
      success: true, 
      message: 'Email verified successfully! Your account is now active. You can proceed to login.' 
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// RESEND VERIFICATION EMAIL
// ------------------------------------------------------------------
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified. You can login to your account.' 
      });
    }

    // Check if last verification request was too recent (prevent spam)
    if (user.lastVerificationRequested) {
      const timeSinceLastRequest = Date.now() - user.lastVerificationRequested;
      const minRequestInterval = 2 * 60 * 1000; // 2 minutes
      
      if (timeSinceLastRequest < minRequestInterval) {
        const waitTime = Math.ceil((minRequestInterval - timeSinceLastRequest) / 1000 / 60);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${waitTime} minute(s) before requesting another verification email.` 
        });
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    user.lastVerificationRequested = Date.now();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({ 
      success: true, 
      message: 'Verification email sent successfully. Please check your inbox and spam folder.' 
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend verification email', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// LOGIN USER
// ------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, rememberMe = false } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Check if verification token is expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your verification link has expired. Please request a new one.',
          needsVerification: true,
          canResend: true,
          email: user.email
        });
      }
      
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        canResend: true,
        email: user.email
      });
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: `Account is ${user.accountStatus}. Please contact support.` 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0; // Reset login attempts on successful login
    await user.save();

    // Generate token
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
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// FORGOT PASSWORD
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - UniDigital Marketplace',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.json({ 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.' 
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// RESET PASSWORD
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

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - UniDigital Marketplace',
      html: `
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset. You can now login with your new password.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    }).catch(err => console.error('Failed to send password reset confirmation:', err));

    res.json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// GET CURRENT USER PROFILE
// ------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
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
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        address: user.address,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// UPDATE PROFILE
// ------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
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
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// CHANGE PASSWORD
// ------------------------------------------------------------------
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
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

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed - UniDigital Marketplace',
      html: `
        <h2>Password Changed Successfully</h2>
        <p>Your password has been changed. If you didn't make this change, please contact support immediately.</p>
      `
    }).catch(err => console.error('Failed to send password change confirmation:', err));

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// UPLOAD AVATAR
// ------------------------------------------------------------------
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate avatar URL (adjust based on your storage)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Avatar uploaded successfully', 
      avatar: avatarUrl 
    });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload avatar', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// DELETE ACCOUNT
// ------------------------------------------------------------------
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
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

    // Store email for confirmation email before deletion
    const userEmail = user.email;
    const userName = `${user.firstName} ${user.lastName}`;

    // Delete user
    await user.deleteOne();

    // Send account deletion confirmation
    await sendEmail({
      to: userEmail,
      subject: 'Account Deleted - UniDigital Marketplace',
      html: `
        <h2>Account Deleted</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been successfully deleted from UniDigital Marketplace.</p>
        <p>We're sorry to see you go. If this was a mistake or you have any feedback, please contact our support team.</p>
      `
    }).catch(err => console.error('Failed to send account deletion confirmation:', err));

    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// LOGOUT USER
// ------------------------------------------------------------------
const logoutUser = async (req, res) => {
  try {
    // In a stateless JWT setup, we don't need to do anything server-side
    // The client will remove the token
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to logout', 
      error: error.message 
    });
  }
};

// ------------------------------------------------------------------
// CHECK AUTH STATUS
// ------------------------------------------------------------------
const checkAuthStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      isAuthenticated: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('❌ Check auth status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check auth status', 
      error: error.message 
    });
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
  uploadAvatar,
  deleteAccount,
  logoutUser,
  checkAuthStatus,
  generateToken
};