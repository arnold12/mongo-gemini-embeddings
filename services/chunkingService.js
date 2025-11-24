import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import logger from '../utils/logger.js';

/**
 * Service for splitting documents into chunks
 */
class ChunkingService {
  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  /**
   * Split documents into smaller chunks
   * @param {Array} documents - Array of LangChain Document objects
   * @returns {Promise<Array>} Array of chunked LangChain Document objects
   */
  async chunkDocuments(documents) {
    try {
      logger.logInfo('Chunking documents', {
        inputCount: documents.length,
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const chunks = await this.splitter.splitDocuments(documents);

      logger.logInfo('Documents chunked successfully', {
        inputCount: documents.length,
        outputCount: chunks.length,
      });

      return chunks;
    } catch (error) {
      logger.logError(error, {
        service: 'chunkingService',
        method: 'chunkDocuments',
      });
      throw error;
    }
  }
}

export default new ChunkingService();
