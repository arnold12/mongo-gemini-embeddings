
import { Document } from '@langchain/core/documents';
import chunkingService from './services/chunkingService.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyChunking() {
  try {
    console.log('Creating large document...');
    // Create a document with > 1000 characters
    const longText = "This is a sentence. ".repeat(100); 
    console.log(`Original text length: ${longText.length}`);

    const docs = [
      new Document({
        pageContent: longText,
        metadata: { source: 'test' }
      })
    ];

    console.log('Chunking document...');
    const chunks = await chunkingService.chunkDocuments(docs);

    console.log(`Number of chunks: ${chunks.length}`);
    
    if (chunks.length <= 1) {
      throw new Error('Document was not chunked! Expected > 1 chunk.');
    }

    chunks.forEach((chunk, i) => {
      console.log(`Chunk ${i + 1} length: ${chunk.pageContent.length}`);
      if (chunk.pageContent.length > 1000) {
        throw new Error(`Chunk ${i + 1} exceeds max size of 1000!`);
      }
    });

    console.log('Verification successful!');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyChunking();
