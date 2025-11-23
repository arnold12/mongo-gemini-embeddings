import express from 'express';
import searchController from '../controllers/searchController.js';
import { validate, searchSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/search
 * Perform similarity search using cosine similarity
 * 
 * Request body:
 * {
 *   "query": "Your search query",
 *   "k": 5,                    // Optional: number of results (default: 2)
 *   "minScore": 0.5,           // Optional: minimum similarity score (default: 0.5)
 *   "filter": {                // Optional: metadata filter
 *     "category": "tech"
 *   }
 * }
 */
router.post(
  '/',
  validate(searchSchema),
  searchController.searchSimilarity.bind(searchController)
);

export default router;

