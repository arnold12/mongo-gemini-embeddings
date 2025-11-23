import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'vector_demo', // Collection name for vector search
  }
);

// Create index for vector search (this should match your Atlas Vector Search index)
// Note: The actual vector index needs to be created in MongoDB Atlas UI
documentSchema.index({ embedding: '2dsphere' });

const Document = mongoose.model('Document', documentSchema);

export default Document;

