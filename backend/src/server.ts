import { app } from './app.js';
import { config } from './config/index.js';
import { db } from './config/db.js';

const startServer = async () => {
  try {
    const isDbConnected = await db.testConnection();
    if (!isDbConnected) {
      console.warn('⚠️ PostgreSQL connection failed. Please ensure PostgreSQL is running.');
    } else {
      console.log('✅ PostgreSQL connected successfully (Raw SQL, No ORM).');
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Smart Resume Management API running on http://localhost:${config.port}`);
      console.log(`📡 API Version: /api/v1`);
      console.log(`🌍 Frontend URL configured: ${config.frontendUrl}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Gracefully shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
