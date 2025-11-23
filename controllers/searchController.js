import searchService from '../services/searchService.js';
import logger from '../utils/logger.js';

/**
 * Controller for search endpoints
 */
class SearchController {
  /**
   * Perform similarity search
   * POST /api/search
   */
  async searchSimilarity(req, res) {
    const requestId = req.id;
    
    try {
      const { query, k, minScore, filter } = req.body;

      logger.logInfo('Performing similarity search', {
        requestId,
        query,
        k,
        minScore,
        hasFilter: !!filter,
      });

      // Perform search
      const results = await searchService.searchSimilarity(
        query,
        k,
        minScore,
        filter,
        requestId
      );

      logger.logInfo('Similarity search completed', {
        requestId,
        query,
        resultsCount: results.length,
      });

      res.json({
        success: true,
        query,
        parameters: {
          k,
          minScore,
          filter,
        },
        resultsCount: results.length,
        results: results.map((item) => ({
          content: item.document.pageContent,
          metadata: item.document.metadata,
          similarityScore: item.score,
          rawScore: item.rawScore,
        })),
        requestId,
      });
    } catch (error) {
      logger.logError(error, {
        requestId,
        endpoint: 'searchSimilarity',
        query: req.body?.query,
      });

      res.status(500).json({
        error: 'Failed to perform similarity search',
        message: error.message,
        requestId,
      });
    }
  }
}

export default new SearchController();

