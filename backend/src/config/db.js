import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  const options = {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    console.log('📡 Connecting to MongoDB Atlas cluster...');
    const conn = await mongoose.connect(mongoUri, options);
    isConnected = true;
    console.log(`✅ [Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('⚠️ [Database] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ [Database] Disconnected from MongoDB Atlas.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('🔄 [Database] Reconnected to MongoDB Atlas.');
    });

    return conn;
  } catch (error) {
    isConnected = false;
    console.warn('\n========================================================================');
    console.warn('⚠️  [MONGODB ATLAS CONNECTION NOTICE]');
    console.warn('Could not establish handshake with MongoDB Atlas cluster.');
    console.warn('Reason:', error.message);
    console.warn('------------------------------------------------------------------------');
    console.warn('👉 Most likely cause: Your network IP is not in Atlas Network Access whitelist.');
    console.warn('👉 Action to fix:');
    console.warn('   1. Log in to your MongoDB Atlas dashboard (https://cloud.mongodb.com)');
    console.warn('   2. Navigate to: Security > Network Access');
    console.warn('   3. Click "+ ADD IP ADDRESS" and select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
    console.warn('      (or add your current public IP: 106.202.121.121)');
    console.warn('   4. Click Confirm.');
    console.warn('========================================================================\n');

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

export const getDbStatus = () => isConnected;
export { connectDB, disconnectDB };
export default connectDB;
