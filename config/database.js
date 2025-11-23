import mongoose from 'mongoose';
import 'dotenv/config';
import logger from '../utils/logger.js';
import { closeNativeClient } from '../utils/dbHelper.js';

const MONGODB_URI = process.env.MONGODB_ATLAS_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_ATLAS_URI environment variable is not set');
}

/**
 * Connect to MongoDB using Mongoose
 */
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      // Ensure db is available
      if (!mongoose.connection.db) {
        // Wait a bit for db to be available
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      logger.logInfo('MongoDB already connected', {
        database: mongoose.connection.name,
      });
      return;
    }

    // Connect with explicit database name to ensure we use project001
    // If the URI doesn't include a database name, Mongoose will use 'test' by default
    // So we explicitly specify it in the connection options
    const connectionOptions = {
      dbName: 'project001', // Explicitly set database name
    };

    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    // Wait for the connection to be fully established
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });

    logger.logInfo('Connected to MongoDB Atlas', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState,
      hasDb: !!mongoose.connection.db,
      dbNameFromOptions: connectionOptions.dbName,
    });
  } catch (error) {
    logger.logError(error, {
      context: 'database',
      action: 'connect',
    });
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    // Close native client first
    await closeNativeClient();
    
    // Then disconnect Mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.logInfo('MongoDB disconnected');
    }
  } catch (error) {
    logger.logError(error, {
      context: 'database',
      action: 'disconnect',
    });
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  logger.logError(err, {
    context: 'database',
    event: 'connection_error',
  });
});

mongoose.connection.on('disconnected', () => {
  logger.logWarning('MongoDB disconnected', {
    context: 'database',
    event: 'disconnected',
  });
});

mongoose.connection.on('connected', () => {
  logger.logInfo('MongoDB connected', {
    context: 'database',
    event: 'connected',
    database: mongoose.connection.name,
  });
});

export { connectDB, disconnectDB };

