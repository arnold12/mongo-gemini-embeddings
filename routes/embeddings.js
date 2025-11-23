import express from 'express';
import embeddingsController from '../controllers/embeddingsController.js';
import { validate, createEmbeddingsSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/embeddings
 * Create embeddings for documents and store them in MongoDB
 *
 * Request body:
 * {
 *   "documents": [
 *     {
 *       "content": "Your text content here",
 *       "metadata": { "category": "tech", "topic": "frontend" }
 *     }
 *   ]
 * }
 */
router.post(
  '/',
  validate(createEmbeddingsSchema),
  embeddingsController.createEmbeddings.bind(embeddingsController)
);

export default router;
