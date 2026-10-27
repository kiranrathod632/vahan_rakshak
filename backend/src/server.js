const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Handle server errors gracefully (e.g. port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another process!`);
    console.error(`👉 Run in terminal: npx kill-port ${PORT} (or Stop-Process) to free the port.`);
  } else {
    console.error('❌ Server startup error:', err);
  }
});

// Only listen locally or in long-running container (not on Vercel serverless)
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 GadiRaksha Backend Server Running!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`💬 Socket.io: Enabled and Ready`);
    console.log(`=================================================\n`);
  });
}

// Export Express app for Vercel Serverless Function runtime
module.exports = app;
