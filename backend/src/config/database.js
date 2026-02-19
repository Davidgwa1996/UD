require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config'); // Import the central config

/**
 * MongoDB Connection Options
 */
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: config.MONGODB_OPTIONS?.serverSelectionTimeoutMS || 10000,
  socketTimeoutMS: config.MONGODB_OPTIONS?.socketTimeoutMS || 45000,
  maxPoolSize: config.MONGODB_OPTIONS?.maxPoolSize || 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  // Add connection timeout
  connectTimeoutMS: 10000,
  // Add heartbeat
  heartbeatFrequencyMS: 10000,
};

/**
 * Connect to MongoDB
 */
const connectDB = async (retries = 3, delay = 5000) => {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      console.log(`\n📡 Connecting to MongoDB Atlas (Attempt ${attempt + 1}/${retries})...`);
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      
      // Success message with details
      console.log('\n' + '='.repeat(50));
      console.log('✅ MongoDB Atlas Connected Successfully!');
      console.log('='.repeat(50));
      console.log(`   📊 Host: ${conn.connection.host}`);
      console.log(`   📁 Database: ${conn.connection.name}`);
      console.log(`   👤 User: ${conn.connection.user || 'unidigital_app'}`);
      console.log(`   🔌 Port: ${conn.connection.port}`);
      console.log(`   🏃 Status: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
      console.log('='.repeat(50) + '\n');
      
      // Set up connection event listeners
      setupConnectionListeners();
      
      return conn;
      
    } catch (error) {
      attempt++;
      
      console.error(`\n❌ MongoDB connection failed (Attempt ${attempt}/${retries}):`);
      console.error(`   Error: ${error.message}`);
      
      if (error.name === 'MongoServerError') {
        handleMongoServerError(error);
      } else if (error.name === 'MongooseServerSelectionError') {
        handleNetworkError(error);
      }
      
      if (attempt < retries) {
        console.log(`\n⏳ Retrying in ${delay/1000} seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        delay *= 2;
      } else {
        handleFinalError(error);
      }
    }
  }
};

/**
 * Set up connection event listeners
 */
const setupConnectionListeners = () => {
  // Connected
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
  });
  
  // Error
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('   🔐 Authentication failed - Check username and password');
    }
  });
  
  // Disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });
  
  // Reconnected
  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });
  
  // Reconnect failed
  mongoose.connection.on('reconnectFailed', () => {
    console.error('❌ MongoDB reconnection failed after all attempts');
  });
  
  // Process termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
  });
};

/**
 * Handle MongoDB server errors
 */
const handleMongoServerError = (error) => {
  console.log('\n🔧 MongoDB Server Error Details:');
  
  if (error.code === 18) {
    console.log('   ⚠️  Authentication failed:');
    console.log('      - Check if username "unidigital_app" is correct');
    console.log('      - Verify password is correct');
    console.log('      - Ensure user has access to the database');
  } else if (error.code === 13) {
    console.log('   ⚠️  Unauthorized:');
    console.log('      - User does not have permissions for this database');
    console.log('      - Check database privileges in Atlas');
  } else if (error.code === 8000) {
    console.log('   ⚠️  Atlas connection string format error:');
    console.log('      - Make sure connection string starts with "mongodb+srv://"');
  } else if (error.codeName === 'NetworkTimeout') {
    console.log('   ⚠️  Network timeout:');
    console.log('      - Check your internet connection');
    console.log('      - Verify Atlas cluster is accessible');
  }
};

/**
 * Handle network errors
 */
const handleNetworkError = (error) => {
  console.log('\n🔧 Network Connection Issues:');
  console.log('   ⚠️  Cannot reach MongoDB Atlas:');
  console.log('      - Check your internet connection');
  console.log('      - Verify Atlas cluster is running (atlas.mongodb.com)');
  console.log('      - Ensure Network Access allows your IP (0.0.0.0/0 for testing)');
  console.log('      - Check if cluster is paused or in recovery');
};

/**
 * Handle final error after all retries
 */
const handleFinalError = (error) => {
  console.log('\n' + '='.repeat(50));
  console.log('❌ FATAL: Could not connect to MongoDB after multiple attempts');
  console.log('='.repeat(50));
  console.log('\n🔍 Troubleshooting Guide:');
  console.log('1️⃣  Check your .env file:');
  console.log('   📁 Current MONGODB_URI:', maskConnectionString(process.env.MONGODB_URI));
  console.log('\n2️⃣  Verify in MongoDB Atlas:');
  console.log('   - Log in to https://cloud.mongodb.com');
  console.log('   - Go to "Network Access" → Add IP Address 0.0.0.0/0');
  console.log('   - Go to "Database Access" → Verify user "unidigital_app" exists');
  console.log('   - Check cluster status (should be running, not paused)');
  console.log('\n3️⃣  Test your connection:');
  console.log('   - Try connecting with MongoDB Compass using the same string');
  console.log('   - Run: mongosh "' + maskConnectionString(process.env.MONGODB_URI) + '"');
  console.log('\n4️⃣  Common fixes:');
  console.log('   - Wait 5-10 minutes after creating new user');
  console.log('   - Make sure password contains no special characters needing encoding');
  console.log('   - Try regenerating connection string from Atlas');
  console.log('='.repeat(50) + '\n');
  
  process.exit(1);
};

/**
 * Mask connection string for safe logging
 */
const maskConnectionString = (uri) => {
  if (!uri) return 'Not provided';
  
  try {
    // Hide password in logs
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:*****@');
  } catch (error) {
    return 'Invalid URI format';
  }
};

/**
 * Get database status
 */
const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models)
  };
};

/**
 * Gracefully disconnect
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

// Export all functions
module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;
module.exports.disconnectDB = disconnectDB;