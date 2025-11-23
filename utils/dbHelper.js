import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import logger from './logger.js';

let nativeClient = null;
let nativeDb = null;

/**
 * Get MongoDB native client (not through Mongoose)
 * This ensures we have a proper native MongoDB client for LangChain
 * @returns {Promise<MongoClient>} MongoDB native client instance
 */
async function getNativeClient() {
  if (nativeClient) {
    return nativeClient;
  }

  // Check if Mongoose is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      'MongoDB connection is not established. Please ensure the database is connected.'
    );
  }

  // Get the connection URI from Mongoose
  const uri = process.env.MONGODB_ATLAS_URI;
  if (!uri) {
    throw new Error('MONGODB_ATLAS_URI environment variable is not set');
  }

  try {
    // Create a native MongoDB client
    nativeClient = new MongoClient(uri);
    await nativeClient.connect();
    
    logger.logInfo('Native MongoDB client connected', {
      context: 'dbHelper',
    });

    return nativeClient;
  } catch (error) {
    logger.logError(error, {
      context: 'dbHelper',
      method: 'getNativeClient',
    });
    throw error;
  }
}

/**
 * Extract database name from MongoDB URI
 * @param {string} uri - MongoDB connection URI
 * @returns {string} Database name
 */
function extractDbNameFromUri(uri) {
  try {
    const url = new URL(uri);
    // Get database name from path (e.g., mongodb://host:port/dbname)
    const pathname = url.pathname;
    if (pathname && pathname.length > 1) {
      // Remove leading slash
      return pathname.substring(1).split('?')[0]; // Remove query params
    }
  } catch (error) {
    logger.logWarning('Failed to parse database name from URI', {
      context: 'dbHelper',
      error: error.message,
    });
  }
  return null;
}

/**
 * Get MongoDB native database instance
 * Ensures connection is ready and db is available
 * @returns {Promise<Object>} MongoDB native database instance
 */
export async function getMongoDB() {
  if (nativeDb) {
    return nativeDb;
  }

  const client = await getNativeClient();
  
  // Determine database name with priority:
  // 1. From connection URI
  // 2. From Mongoose connection name (if it's not 'test')
  // 3. Default to 'project001'
  const uri = process.env.MONGODB_ATLAS_URI;
  let dbName = extractDbNameFromUri(uri);
  
  if (!dbName) {
    // If Mongoose is connected to a specific database (not default 'test'), use it
    const mongooseDbName = mongoose.connection.name;
    if (mongooseDbName && mongooseDbName !== 'test') {
      dbName = mongooseDbName;
    } else {
      // Default to project001
      dbName = 'project001';
    }
  }

  nativeDb = client.db(dbName);

  logger.logInfo('Got MongoDB native db', {
    context: 'dbHelper',
    dbName,
    mongooseDbName: mongoose.connection.name,
    uriDbName: extractDbNameFromUri(uri),
  });

  return nativeDb;
}

/**
 * Get MongoDB collection
 * Returns a native MongoDB collection that works with LangChain
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Object>} MongoDB collection instance
 */
export async function getCollection(collectionName = 'vector_demo') {
  const db = await getMongoDB();
  const collection = db.collection(collectionName);
  
  // Log collection details for debugging
  logger.logInfo('Getting MongoDB collection', {
    context: 'dbHelper',
    collectionName,
    databaseName: db.databaseName,
    hasCollection: !!collection,
  });
  
  // Verify collection has the required structure
  if (!collection || !collection.db || !collection.db.client) {
    throw new Error(
      'Collection does not have the required structure. Ensure you are using a native MongoDB collection.'
    );
  }

  return collection;
}

/**
 * Close native MongoDB client
 */
export async function closeNativeClient() {
  if (nativeClient) {
    await nativeClient.close();
    nativeClient = null;
    nativeDb = null;
    logger.logInfo('Native MongoDB client closed', {
      context: 'dbHelper',
    });
  }
}

