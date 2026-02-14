const nodemailer = require('nodemailer');
require('dotenv').config(); // loads your .env variables

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendTest() {
  try {
    await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: 'davidmaina3713413@gmail.com', // change to your own email if you like
      subject: 'Test Email from UniDigital',
      text: 'If you receive this, SMTP is working correctly.',
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
  }
}

sendTest();