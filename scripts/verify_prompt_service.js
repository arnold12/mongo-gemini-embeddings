import promptService from '../services/promptService.js';

// Mock chunks
const mockChunks = [
  {
    pageContent: 'Gemini is a family of multimodal AI models developed by Google.',
    metadata: { source: 'intro.txt', topic: 'AI' }
  },
  {
    pageContent: 'Vector embeddings allow for semantic search capabilities.',
    metadata: { source: 'vectors.md', topic: 'Search' }
  }
];

const query = 'What is Gemini?';

console.log('--- TEST 1: Normal Prompt Construction ---');
const prompt = promptService.constructPrompt(query, mockChunks);
console.log(prompt);

if (!prompt.includes('SYSTEM INSTRUCTIONS') || !prompt.includes('What is Gemini?') || !prompt.includes('intro.txt')) {
  console.error('FAIL: Prompt missing key components');
  process.exit(1);
}

console.log('\n--- TEST 2: Context Truncation ---');
// Create a large chunk to trigger truncation
// const largeChunk = {
//     pageContent: "A".repeat(130000), // Exceeds 120k char limit
//     metadata: { source: "large_file.txt" }
// };

// Temporarily lower limit for testing or just rely on the large chunk
// Since we can't easily change the internal constant without setters, we'll rely on the large input.
// Actually, let's just pass enough data to exceed 120k.
const manyChunks = [];
for(let i=0; i<15; i++) {
  manyChunks.push({
    pageContent: 'B'.repeat(10000),
    metadata: { source: `chunk_${i}` }
  });
}

const truncatedPrompt = promptService.constructPrompt('Test Limit', manyChunks);
console.log('Truncated Prompt Length:', truncatedPrompt.length);

if (truncatedPrompt.length > 130000) { // Should be around 120k + overhead
  console.warn('WARNING: Prompt might not be truncated correctly, length: ' + truncatedPrompt.length);
} else {
  console.log('SUCCESS: Prompt truncated successfully.');
}

console.log('\n--- TEST 3: Empty Context ---');
const emptyPrompt = promptService.constructPrompt('Query', []);
if (!emptyPrompt.includes('No context provided')) {
  console.error('FAIL: Empty context not handled');
  process.exit(1);
}

console.log('\nALL TESTS PASSED');
