// scripts/setup-paypal.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 Setting up PayPal integration for UniDigital...\n');

// Check if PayPal credentials are set
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error('❌ PayPal credentials not found in .env file');
  console.log('\nPlease add these to your .env file:');
  console.log('PAYPAL_CLIENT_ID=your_client_id_here');
  console.log('PAYPAL_CLIENT_SECRET=your_client_secret_here');
  console.log('PAYPAL_ENVIRONMENT=sandbox (or "live" for production)');
  process.exit(1);
}

console.log('✅ PayPal credentials found');
console.log(`📝 Environment: ${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}`);
console.log(`🔑 Client ID: ${process.env.PAYPAL_CLIENT_ID.substring(0, 10)}...`);

// Test PayPal SDK
try {
  const paypal = require('@paypal/checkout-server-sdk');
  
  let environment;
  if (process.env.PAYPAL_ENVIRONMENT === 'production') {
    environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  } else {
    environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  }
  
  const client = new paypal.core.PayPalHttpClient(environment);
  console.log('✅ PayPal SDK initialized successfully');
  
  // Test endpoints configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const returnUrl = `${frontendUrl}/payment/success`;
  const cancelUrl = `${frontendUrl}/payment/cancel`;
  
  console.log('\n🌐 Endpoints configured:');
  console.log(`   Return URL: ${returnUrl}`);
  console.log(`   Cancel URL: ${cancelUrl}`);
  
  console.log('\n🎉 PayPal setup complete!');
  console.log('\nNext steps:');
  console.log('1. Test with: npm run dev');
  console.log('2. Visit: http://localhost:5000/api/health');
  console.log('3. Test PayPal Sandbox buyer: sb-43f2gz29294202@personal.example.com');
  console.log('4. Password: 12345678');
  
} catch (error) {
  console.error('❌ Error setting up PayPal:', error.message);
  console.log('\nMake sure to install dependencies:');
  console.log('npm install @paypal/checkout-server-sdk');
  process.exit(1);
}