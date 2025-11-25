import { Document } from '@langchain/core/documents';
import BaseVectorService from './baseVectorService.js';
import chunkingService from './chunkingService.js';
// import preprocessingService from './preprocessingService.js';
import logger from '../utils/logger.js';

/**
 * Service for creating and managing embeddings
 */
class EmbeddingsService extends BaseVectorService {
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

      // Chunk documents
      const chunkedDocuments = await chunkingService.chunkDocuments(langchainDocuments);

      // Generate embeddings and store in MongoDB
      logger.logInfo('Generating embeddings and storing documents', {
        requestId,
        originalCount: documents.length,
        chunkedCount: chunkedDocuments.length,
      });

      await vectorStore.addDocuments(chunkedDocuments);

      logger.logInfo('Documents stored successfully', {
        requestId,
        originalCount: documents.length,
        chunkedCount: chunkedDocuments.length,
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
