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
      accountStatus: 'active'
    });

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(user, verificationToken);
    await sendWelcomeEmail(user);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user
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
      user
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// ------------------------------------------------------------------
// UPLOAD AVATAR
// ------------------------------------------------------------------
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ success: true, message: 'Avatar uploaded successfully', avatar: user.avatar });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload avatar', error: error.message });
  }
};

// ------------------------------------------------------------------
// EXPORT ALL CONTROLLERS
// ------------------------------------------------------------------
module.exports = {
  registerUser,
  loginUser,
  uploadAvatar,
  generateToken
};
