import Joi from 'joi';

/**
 * Validation schemas for API endpoints
 */

// Schema for document in embeddings request
const documentSchema = Joi.object({
  content: Joi.string().required().min(1).messages({
    'string.empty': 'Document content cannot be empty',
    'any.required': 'Document content is required',
  }),
  metadata: Joi.object().default({}).unknown(true),
});

// Schema for embeddings creation request
export const createEmbeddingsSchema = Joi.object({
  documents: Joi.array()
    .items(documentSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one document is required',
      'any.required': 'documents array is required',
    }),
});

// Schema for search request
export const searchSchema = Joi.object({
  query: Joi.string().required().min(1).messages({
    'string.empty': 'Query cannot be empty',
    'any.required': 'Query is required',
  }),
  k: Joi.number().integer().min(1).max(100).default(2).messages({
    'number.min': 'k must be at least 1',
    'number.max': 'k cannot exceed 100',
  }),
  minScore: Joi.number().min(0).max(1).default(0.5).messages({
    'number.min': 'minScore must be between 0 and 1',
    'number.max': 'minScore must be between 0 and 1',
  }),
  filter: Joi.object().unknown(true).default(null).allow(null),
});

/**
 * Middleware to validate request body against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request data',
        details: errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

