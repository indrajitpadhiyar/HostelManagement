import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas and start HTTP server
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 HostelEase Enterprise Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔐 API Gateway:  http://localhost:${PORT}/api/v1`);
      console.log(`🌱 Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Graceful Shutdown Handler
    const shutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('🔒 HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown after 10s timeout
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to initialize HostelEase Server:', error);
    process.exit(1);
  }
}

startServer();
