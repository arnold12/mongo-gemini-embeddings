
import { connectDB, disconnectDB } from '../config/database.js';
import { getCollection } from '../utils/dbHelper.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

async function recreateIndex() {
  try {
    await connectDB();
    const collection = await getCollection('vector_demo');
    
    const definition = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine"
          },
          {
            type: "filter",
            path: "category"
          }
        ]
      }
    };

    console.log('Dropping search index...');
    try {
      await collection.dropSearchIndex('vector_index');
      console.log('Search index dropped.');
    } catch (e) {
      console.log('Error dropping index (might not exist):', e.message);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Creating search index...');
    await collection.createSearchIndex(definition);
    console.log('Search index created successfully.');
    
  } catch (error) {
    console.error('Error recreating index:', error);
  } finally {
    await disconnectDB();
  }
}

recreateIndex();
