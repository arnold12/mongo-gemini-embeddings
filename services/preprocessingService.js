// src/services/preprocessingService.js
import he from 'he'; // For fixing HTML entities
// import { JSDOM } from "jsdom"; // For HTML cleanup and extraction

class PreprocessingService {
  /**
   * Main function to preprocess documents
   * Accepts array of { id, text } or simple strings
   */
  preprocessDocuments(documents) {
    return documents.map((doc) => {
      const isString = typeof doc === 'string';
      const text = isString ? doc : doc.content || doc.text || '';
      const cleanedText = this.cleanText(text);

      if (isString) return cleanedText;

      return {
        ...doc,
        content: cleanedText,
      };
    });
  }

  cleanText(text) {
    let output = text;

    // 1️⃣ Fix encoding (convert HTML entities → normal text)
    output = he.decode(output);

    // 2️⃣ Remove HTML tags completely
    output = this.stripHTML(output);

    // 3️⃣ Normalize bullets (•, -, *, → use a unified pattern)
    output = this.normalizeBullets(output);

    // 4️⃣ Remove boilerplate (headers, footers, page nos)
    output = this.removeBoilerplate(output);

    // 5️⃣ Remove extra spaces, newlines, tabs
    output = this.normalizeWhitespace(output);

    return output.trim();
  }

  stripHTML(text) {
    // Use regex to replace tags with spaces to preserve word boundaries
    // JSDOM textContent can merge words (e.g. <div>A</div><div>B</div> -> AB)
    return text.replace(/<[^>]+>/g, ' ');
  }

  normalizeBullets(text) {
    return text
      .replace(/[•●▪◦◆■]/g, '-') // replace bullet symbols
      .replace(/\*\s+/g, '- ') // * bullet
      .replace(/-\s*-/g, '-') // avoid double dashes
      .replace(/\n\s*-\s*/g, '\n- '); // clean dash formatting
  }

  removeBoilerplate(text) {
    let output = text;

    // Remove page numbers like "Page 1", "Page 2"
    output = output.replace(/Page\s+\d+/gi, '');

    // Remove headers like "Company Confidential", "Footer text", etc.
    // Use multiline anchors to avoid matching words in the middle of sentences
    const boilerplatePatterns = [
      /copyright\s*\d{4}/gi,
      /all rights reserved/gi,
      /confidential/gi,
      /^footer[:\s].*$/gim,
      /^header[:\s].*$/gim,
    ];

    boilerplatePatterns.forEach((pattern) => {
      output = output.replace(pattern, '');
    });

    return output;
  }

  normalizeWhitespace(text) {
    return text
      .replace(/\r/g, '')
      .replace(/[\t\u00A0 ]+/g, ' ') // tabs, nbsp, spaces → one space
      .replace(/\n{2,}/g, '\n'); // multiple newlines → single
  }
}

export default new PreprocessingService();
