const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('SMTP config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  // pass: hidden for security
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Add a connection timeout to see if it helps
  connectionTimeout: 10000, // 10 seconds
});

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: 'davidmaina3713413@gmail.com', // or another email you control
      subject: 'Test Email from UniDigital',
      text: 'If you receive this, SMTP is working correctly.',
    });
    console.log('✅ Test email sent successfully!', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
  }
}

sendTest();