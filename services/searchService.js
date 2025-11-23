import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import logger from '../utils/logger.js';
import { getCollection } from '../utils/dbHelper.js';

/**
 * Service for performing similarity search
 */
class SearchService {
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
    return new MongoDBAtlasVectorSearch(this.embeddings, {
      collection: collection,
      indexName: 'vector_index', // Must match the index name created in Atlas UI
      textKey: 'text', // Field where the raw text is stored
      embeddingKey: 'embedding', // Field where the vector is stored
    });
  }

  /**
   * Normalize similarity score
   * Handles both similarity scores (0-1, higher = better) and distance scores (lower = better)
   */
  normalizeScore(score) {
    // If score > 1, it's likely a distance score (cosine distance = 1 - cosine similarity)
    if (score > 1) {
      return 1 - score;
    }
    // Negative scores are possible with cosine similarity, normalize to 0-1
    if (score < 0) {
      return (score + 1) / 2;
    }
    // Assume it's already a similarity score (0-1)
    return score;
  }

  /**
   * Perform similarity search using cosine similarity
   * @param {string} query - The search query string
   * @param {number} k - Number of similar documents to retrieve
   * @param {number} minScore - Minimum similarity score threshold (0-1)
   * @param {Object} filter - Optional metadata filter
   * @param {string} requestId - Request ID for logging
   * @returns {Promise<Array>} Array of similar documents with scores
   */
  async searchSimilarity(
    query,
    k = 2,
    minScore = 0.5,
    filter = null,
    requestId = null
  ) {
    try {
      const vectorStore = await this.getVectorStore();

      logger.logInfo('Performing vector similarity search', {
        requestId,
        query,
        k,
        minScore,
        hasFilter: !!filter,
      });

      // Retrieve the top k most similar documents with their similarity scores
      let resultsWithScores;
      try {
        resultsWithScores = await vectorStore.similaritySearchWithScore(
          query,
          k,
          filter
        );
      } catch (error) {
        // Fallback if similaritySearchWithScore is not available
        logger.logWarning(
          'similaritySearchWithScore not available, using similaritySearch',
          {
            requestId,
            error: error.message,
          }
        );
        const results = await vectorStore.similaritySearch(query, k, filter);
        return results.map((doc) => ({
          document: doc,
          score: null,
          rawScore: null,
        }));
      }

      // Normalize and filter results by minimum score threshold
      const normalizedResults = resultsWithScores.map(([doc, score]) => {
        const similarityScore = this.normalizeScore(score);
        return { doc, score, similarityScore };
      });

      // Filter by threshold
      const filteredResults = normalizedResults.filter(
        ({ similarityScore }) => {
          return similarityScore >= minScore;
        }
      );

      if (filteredResults.length === 0) {
        logger.logWarning('No results found above similarity threshold', {
          requestId,
          query,
          minScore,
          totalResults: resultsWithScores.length,
        });
        return [];
      }

      logger.logInfo('Similarity search completed', {
        requestId,
        query,
        resultsFound: filteredResults.length,
        totalResults: resultsWithScores.length,
      });

      // Return documents with scores
      return filteredResults.map(({ doc, score, similarityScore }) => ({
        document: doc,
        score: similarityScore,
        rawScore: score,
      }));
    } catch (error) {
      logger.logError(error, {
        requestId,
        service: 'searchService',
        method: 'searchSimilarity',
        query,
      });
      throw error;
    }
  }
}

export default new SearchService();
