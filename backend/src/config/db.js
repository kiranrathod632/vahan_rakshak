const mongoose = require('mongoose');
const dns = require('dns');

// Configure DNS resolvers for reliable MongoDB Atlas SRV connection on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1','0.0.0.0']);
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

  const srvUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://kiranrathod632_db_user:lKtisnFylyZbc1hs@cluster0.dvpntjn.mongodb.net/gadiraksha_db?retryWrites=true&w=majority&authSource=admin';
  const directUri = 'mongodb://kiranrathod632_db_user:lKtisnFylyZbc1hs@ac-w2smxjw-shard-00-00.dvpntjn.mongodb.net:27017,ac-w2smxjw-shard-00-01.dvpntjn.mongodb.net:27017,ac-w2smxjw-shard-00-02.dvpntjn.mongodb.net:27017/gadiraksha_db?ssl=true&replicaSet=atlas-d9llag-shard-0&authSource=admin&retryWrites=true&w=majority';

  // 1. Try standard SRV URI
  try {
    const conn = await mongoose.connect(srvUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4
      tls: true,
      tlsAllowInvalidCertificates: true
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return;
  } catch (srvErr) {
    // 2. If SRV had TLS / SSL Alert 80, try Direct ReplicaSet URI
    try {
      const conn = await mongoose.connect(directUri, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
        tls: true,
        tlsAllowInvalidCertificates: true
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected (Direct ReplicaSet): ${conn.connection.host} (Database: ${conn.connection.name})`);
      return;
    } catch (directErr) {
      isConnected = false;
      console.error(`\n❌ MongoDB Atlas Connection Error: ${srvErr.message}`);
      if (srvErr.message.includes('whitelisted') || srvErr.message.includes('SSL alert') || srvErr.message.includes('Could not connect to any servers')) {
        console.error(`-----------------------------------------------------------`);
        console.error(`⚠️  HOW TO FIX: MongoDB Atlas IP Whitelist (1 Minute Fix)`);
        console.error(`Atlas Envoy proxy rejects TLS handshake (SSL alert 80) if client IP is not in Network Access.`);
        console.error(`1. Open https://cloud.mongodb.com and log in`);
        console.error(`2. Left Menu -> Security -> Network Access`);
        console.error(`3. Click "+ ADD IP ADDRESS"`);
        console.error(`4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)`);
        console.error(`5. Click "Confirm" (wait ~30s for Status: Active)`);
        console.error(`-----------------------------------------------------------\n`);
      }
      throw srvErr;
    }
  }
};

module.exports = connectDB;
