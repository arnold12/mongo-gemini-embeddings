import embeddingsService from '../services/embeddingsService.js';
import logger from '../utils/logger.js';

/**
 * Controller for embeddings endpoints
 */
class EmbeddingsController {
  /**
   * Create embeddings for documents
   * POST /api/embeddings
   */
  async createEmbeddings(req, res) {
    const requestId = req.id;

    try {
      const { documents } = req.body;

      logger.logInfo('Creating embeddings', {
        requestId,
        documentCount: documents.length,
      });

      // Create embeddings
      const result = await embeddingsService.createEmbeddings(
        documents,
        requestId
      );

      logger.logInfo('Embeddings created successfully', {
        requestId,
        documentsProcessed: result.count,
      });

      res.status(201).json({
        success: true,
        message: 'Embeddings created and stored successfully',
        documentsProcessed: result.count,
        requestId,
      });
    } catch (error) {
      logger.logError(error, {
        requestId,
        endpoint: 'createEmbeddings',
        documentCount: req.body?.documents?.length,
      });

      res.status(500).json({
        error: 'Failed to create embeddings',
        message: error.message,
        requestId,
      });
    }
  }
}

export default new EmbeddingsController();
