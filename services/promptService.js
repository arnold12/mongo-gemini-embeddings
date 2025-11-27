import logger from '../utils/logger.js';

class PromptService {
  constructor() {
    // Default context limit (approx tokens). Gemini 1.5 Flash has 1M+, Pro has 32k/1M+.
    // Setting a safe default for "context window limit" consideration.
    // 1 token ~= 4 chars. 30,000 tokens ~= 120,000 chars.
    this.MAX_CONTEXT_CHARS = 120000;
  }

  /**
   * Constructs the final prompt for the LLM
   * @param {string} query - The user's query
   * @param {Array} chunks - Retrieved chunks with content and metadata
   * @returns {string} The formatted prompt
   */
  constructPrompt(query, chunks) {
    try {
      const systemInstruction = this._getSystemInstruction();
      let contextBlock = this._formatContext(chunks);
      
      // Assemble parts
      let prompt = this._buildPromptString(systemInstruction, query, contextBlock);

      // Check if we exceeded the limit (naive character count check)
      if (prompt.length > this.MAX_CONTEXT_CHARS) {
        logger.logInfo('Prompt exceeded limit, truncating context...', {
          currentLength: prompt.length,
          limit: this.MAX_CONTEXT_CHARS
        });
        
        // Re-format with truncation
        contextBlock = this._formatContext(chunks, true);
        prompt = this._buildPromptString(systemInstruction, query, contextBlock);
      }

      return prompt;
    } catch (error) {
      logger.logError(error, { service: 'PromptService', method: 'constructPrompt' });
      throw error;
    }
  }

  _buildPromptString(systemInstruction, query, contextBlock) {
    return `${systemInstruction}\n\nUSER QUERY:\n"${query}"\n\nCONTEXT:\n${contextBlock}\n\nANSWER:`;
  }

  _getSystemInstruction() {
    return `
SYSTEM INSTRUCTIONS:
You are an intelligent and helpful AI assistant powered by Google Gemini.
Your role is to answer user queries accurately based ONLY on the provided context.

CONSTRAINTS & GENERATION STYLE:
1. **Strict Grounding**: Answer ONLY using the information provided in the "CONTEXT" section. Do not use outside knowledge.
2. **Refuse Hallucinations**: If the answer is not found in the context, state clearly: "I cannot answer this question based on the provided context." Do not make up an answer.
3. **Citations**: You MUST cite your sources. When using information from a chunk, reference its source (e.g., [Source: Title/Filename]).
4. **Tone**: Professional, concise, and direct.
5. **Formatting**: Use Markdown for readability (bullet points, bold text for key terms).
`.trim();
  }

  _formatContext(chunks, enforceLimit = false) {
    if (!chunks || chunks.length === 0) {
      return 'No context provided.';
    }

    let formattedContext = '';
    
    for (const chunk of chunks) {
      const content = chunk.pageContent || chunk.content || '';
      const metadata = chunk.metadata || {};
      const source = metadata.source || metadata.title || 'Unknown Source';
      
      const chunkString = `
---
Source: ${source}
Metadata: ${JSON.stringify(metadata)}
Content:
${content}
---
`;
      
      if (enforceLimit && (formattedContext.length + chunkString.length > this.MAX_CONTEXT_CHARS)) {
        break; // Stop adding chunks if we hit the limit
      }

      formattedContext += chunkString;
    }

    return formattedContext;
  }
}

export default new PromptService();
