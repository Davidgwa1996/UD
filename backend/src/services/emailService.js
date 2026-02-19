const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD, // Your Gmail app password
  },
  // Add connection pool for better performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

/**
 * Send verification email using Nodemailer
 * @param {Object} user - User object
 * @param {string} token - Verification token
 */
exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'UniDigital Marketplace'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Verify your email address - UniDigital Marketplace',
    text: `Welcome to UniDigital Marketplace! Please verify your email by clicking this link: ${verificationUrl}. This link expires in 24 hours.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300;">UniDigital Marketplace</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Digital Products Destination</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0; font-weight: 400;">Hello ${user.name || 'there'}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">Thank you for signing up for UniDigital Marketplace! We're excited to have you on board. To get started with shopping and exploring our digital products, please verify your email address.</p>
          
          <!-- Big prominent button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);">Verify Email Address</a>
          </div>
          
          <!-- Alternative link -->
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 30px 0; border-radius: 5px;">
            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;"><strong>Link doesn't work?</strong> Copy and paste this into your browser:</p>
            <p style="font-size: 13px; background: white; padding: 12px; border-radius: 5px; word-break: break-all; border: 1px solid #e0e0e0; margin: 0;">${verificationUrl}</p>
          </div>
          
          <!-- Expiry notice -->
          <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 12px; border-radius: 5px; margin: 25px 0; font-size: 14px;">
            <strong>⏰ Expiry Notice:</strong> This verification link will expire in 24 hours for security reasons.
          </div>
          
          <!-- Security notice -->
          <p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 25px;">
            If you didn't create an account with UniDigital Marketplace, please ignore this email or contact our support team if you have concerns.
          </p>
          
          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">
              <span style="color: #667eea;">UniDigital Marketplace</span> | Secure Digital Downloads
            </p>
            <p style="margin: 5px 0;">
              This is an automated message, please do not reply directly to this email.
            </p>
            <p style="margin: 15px 0 0 0;">
              &copy; ${new Date().getFullYear()} UniDigital Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Add headers for better email deliverability
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${user.email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    
    // More detailed error logging
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check your Gmail app password.');
    } else if (error.code === 'ESOCKET') {
      throw new Error('Network error while sending email. Check your internet connection.');
    } else {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
};

/**
 * Send welcome email after successful verification
 * @param {Object} user - User object
 */
exports.sendWelcomeEmail = async (user) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  const shopUrl = `${process.env.FRONTEND_URL}/products`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'UniDigital Marketplace'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Welcome to UniDigital Marketplace - Email Verified! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to UniDigital</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Email Verified! 🎉</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; margin-top: 0;">Welcome aboard, ${user.name || 'valued customer'}!</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">Your email has been successfully verified. You now have full access to all features of UniDigital Marketplace.</p>
          
          <div style="display: flex; justify-content: space-between; margin: 35px 0; text-align: center;">
            <div style="flex: 1; padding: 10px;">
              <div style="font-size: 40px; margin-bottom: 10px;">🛍️</div>
              <h3 style="margin: 0 0 5px 0;">Shop Now</h3>
              <p style="font-size: 13px; color: #666;">Browse our digital products</p>
            </div>
            <div style="flex: 1; padding: 10px;">
              <div style="font-size: 40px; margin-bottom: 10px;">💳</div>
              <h3 style="margin: 0 0 5px 0;">Secure Payments</h3>
              <p style="font-size: 13px; color: #666;">Multiple payment options</p>
            </div>
            <div style="flex: 1; padding: 10px;">
              <div style="font-size: 40px; margin-bottom: 10px;">⚡</div>
              <h3 style="margin: 0 0 5px 0;">Instant Access</h3>
              <p style="font-size: 13px; color: #666;">Download immediately</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${shopUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; margin-right: 10px;">Start Shopping</a>
            <a href="${loginUrl}" style="background: white; color: #28a745; padding: 12px 33px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid #28a745;">Login to Account</a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">✨ What's next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">Complete your profile for personalized recommendations</li>
              <li style="margin-bottom: 8px;">Browse our latest digital products and exclusive deals</li>
              <li style="margin-bottom: 8px;">Save items to your wishlist for later purchase</li>
              <li style="margin-bottom: 8px;">Check out our customer reviews and ratings</li>
            </ul>
          </div>
          
          <p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 25px;">
            Need help? Contact our support team at support@unidigital.com
          </p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw here - welcome email failure shouldn't break the flow
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} token - Reset token
 */
exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'UniDigital Marketplace'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Password Reset Request - UniDigital Marketplace',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link expires in 1 hour.</p>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};