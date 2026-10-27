const mongoose = require('mongoose');
const dns = require('dns');

// Configure DNS resolvers for reliable MongoDB Atlas SRV connection on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system default if not supported
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const atlasFallback = 'mongodb+srv://kiranrathod632_db_user:lKtisnFylyZbc1hs@cluster0.dvpntjn.mongodb.net/gadiraksha_db?retryWrites=true&w=majority';
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || atlasFallback;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
