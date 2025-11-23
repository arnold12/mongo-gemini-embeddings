import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/database.js';
import embeddingsRoutes from './routes/embeddings.js';
import searchRoutes from './routes/search.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (JSON format)
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/embeddings', embeddingsRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => {
  logger.logWarning('Route not found', {
    method: req.method,
    path: req.path,
    requestId: req.id,
  });
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    requestId: req.id,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.logError(err, {
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      logger.logInfo('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        endpoints: [
          'POST /api/embeddings - Create embeddings',
          'POST /api/search - Search similarity',
          'GET /health - Health check',
        ],
      });
    });
  } catch (error) {
    logger.logError(error, {
      context: 'server',
      action: 'start',
    });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.logInfo('Shutting down server...', {
    signal: 'SIGINT',
  });
  const { disconnectDB } = await import('./config/database.js');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.logInfo('Shutting down server...', {
    signal: 'SIGTERM',
  });
  const { disconnectDB } = await import('./config/database.js');
  await disconnectDB();
  process.exit(0);
});

startServer();

export default app;
