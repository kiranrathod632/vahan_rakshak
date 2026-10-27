const mongoose = require('mongoose');
const dns = require('dns');

// Configure DNS resolvers for reliable MongoDB Atlas SRV connection on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system default if not supported
}

// Reduce buffer timeout so requests fail fast with clear message instead of hanging
mongoose.set('bufferTimeoutMS', 5000);

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
      serverSelectionTimeoutMS: 8000,
      family: 4, // Force IPv4 to prevent Windows IPv6 timeout hang
      tls: true,
      tlsAllowInvalidCertificates: true // Bypass TLS certificate chain verification issues on Windows
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    isConnected = false;
    console.error(`\n❌ MongoDB Atlas Connection Error: ${error.message}`);
    if (error.message.includes('whitelisted') || error.message.includes('Could not connect to any servers')) {
      console.error(`\n-----------------------------------------------------------`);
      console.error(`⚠️  HOW TO FIX: MongoDB Atlas IP Whitelist (1 Minute Fix)`);
      console.error(`1. Open https://cloud.mongodb.com and log in`);
      console.error(`2. Left Menu -> Security -> Network Access`);
      console.error(`3. Click "+ ADD IP ADDRESS"`);
      console.error(`4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)`);
      console.error(`5. Click "Confirm" (takes ~30s to activate)`);
      console.error(`-----------------------------------------------------------\n`);
    }
    throw error;
  }
};

module.exports = connectDB;
