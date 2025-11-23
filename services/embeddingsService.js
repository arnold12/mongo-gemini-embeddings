import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { Document } from '@langchain/core/documents';
import logger from '../utils/logger.js';
import { getCollection } from '../utils/dbHelper.js';

/**
 * Service for creating and managing embeddings
 */
class EmbeddingsService {
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

    // Log collection details including database name
    logger.logInfo('Initializing vector store', {
      collectionName: collection.collectionName,
      databaseName: collection.db.databaseName,
      hasClient: !!collection.db.client,
    });

    return new MongoDBAtlasVectorSearch(this.embeddings, {
      collection: collection,
      indexName: 'vector_index', // Must match the index name created in Atlas UI
      textKey: 'text', // Field where the raw text will be stored
      embeddingKey: 'embedding', // Field where the vector will be stored
    });
  }

  /**
   * Create embeddings for documents and store them in MongoDB
   * @param {Array} documents - Array of documents with content and metadata
   * @param {string} requestId - Request ID for logging
   * @returns {Promise<Object>} Result object with success status and count
   */
  async createEmbeddings(documents, requestId = null) {
    try {
      // Convert to LangChain Document format
      const langchainDocuments = documents.map(
        (doc) =>
          new Document({
            pageContent: doc.content,
            metadata: doc.metadata || {},
          })
      );

      // Initialize vector store
      const vectorStore = await this.getVectorStore();

      // Generate embeddings and store in MongoDB
      logger.logInfo('Generating embeddings and storing documents', {
        requestId,
        documentCount: documents.length,
      });

      await vectorStore.addDocuments(langchainDocuments);

      logger.logInfo('Documents stored successfully', {
        requestId,
        documentCount: documents.length,
      });

      return {
        success: true,
        count: documents.length,
      };
    } catch (error) {
      logger.logError(error, {
        requestId,
        service: 'embeddingsService',
        method: 'createEmbeddings',
      });
      throw error;
    }
  }
}

export default new EmbeddingsService();
