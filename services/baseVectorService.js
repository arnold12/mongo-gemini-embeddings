import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import logger from '../utils/logger.js';
import { getCollection } from '../utils/dbHelper.js';

/**
 * Base service for vector operations
 */
class BaseVectorService {
  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004', // Output dimensions: 768
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  /**
   * Initialize vector store
   */
  async getVectorStore() {
    const collection = await getCollection('vector_demo');

    // Log collection details
    logger.logInfo('Initializing vector store', {
      service: this.constructor.name,
      collectionName: collection.collectionName,
      databaseName: collection.db.databaseName,
    });

    return new MongoDBAtlasVectorSearch(this.embeddings, {
      collection: collection,
      indexName: 'vector_index', // Must match the index name created in Atlas UI
      textKey: 'text', // Field where the raw text is stored
      embeddingKey: 'embedding', // Field where the vector is stored
    });
  }
}

export default BaseVectorService;
