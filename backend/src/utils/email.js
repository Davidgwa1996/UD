const nodemailer = require('nodemailer');

/**
 * Create transporter using SendGrid SMTP
 */
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('🔧 Using production SMTP server (SendGrid)');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER, // 'apikey'
        pass: process.env.SMTP_PASS  // SendGrid API key
      }
    });
  }

  // Development: Ethereal (preview emails)
  console.log('🔧 Using Ethereal dev SMTP server');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Unidigitalcom" <noreply@unidigitalcom.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #2563eb;">Verify Your Email</h2>
      <p>Hello <strong>${user.firstName}</strong>,</p>
      <p>Click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600;">
        Verify Email
      </a>
      <p style="color: #666;">This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Unidigitalcom',
    html
  });
};

/**
 * Optional: Welcome email
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Welcome to Unidigitalcom!</h1>
      <p>Hello <strong>${user.firstName}</strong>,</p>
      <p>Thank you for creating an account with us. We're excited to have you onboard!</p>
      <p>Start exploring our products and enjoy a seamless shopping experience.</p>
      <p>The Unidigitalcom Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Unidigitalcom!',
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail
};
