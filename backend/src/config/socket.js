const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific frontend domain in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ New client connected via Socket.io: ${socket.id}`);

    // Join vehicle owner or tag specific room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on('join_tag_room', (tagCode) => {
      if (tagCode) {
        socket.join(`tag:${tagCode.toUpperCase()}`);
        console.log(`🚗 Socket ${socket.id} joined room tag:${tagCode.toUpperCase()}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
