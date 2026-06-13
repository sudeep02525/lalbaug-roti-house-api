import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Connect to MongoDB
connectDB();

import { initSocket } from './src/socket.js';

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
});

// Triggering restart again for email fixes
