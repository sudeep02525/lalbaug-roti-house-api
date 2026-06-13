import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for the admin panel
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Admin connected to notifications socket:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Admin disconnected from notifications:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
