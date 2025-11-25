// src/services/preprocessingService.js
import he from "he"; // For fixing HTML entities
import { JSDOM } from "jsdom"; // For HTML cleanup and extraction

class PreprocessingService {
  /**
   * Main function to preprocess documents
   * Accepts array of { id, text } or simple strings
   */
  preprocessDocuments(documents) {
    return documents.map((doc) => {
      const text = typeof doc === "string" ? doc : doc.text;
      const cleanedText = this.cleanText(text);
      return {
        ...doc,
        text: cleanedText,
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
    try {
      const dom = new JSDOM(text);
      return dom.window.document.body.textContent || "";
    } catch (error) {
      console.error("Error stripping HTML:", error);
      return text.replace(/<[^>]+>/g, " ");
    }
  }

  normalizeBullets(text) {
    return text
      .replace(/[•●▪◦◆■]/g, "-") // replace bullet symbols
      .replace(/\*\s+/g, "- ") // * bullet
      .replace(/-\s*-/g, "-") // avoid double dashes
      .replace(/\n\s*-\s*/g, "\n- "); // clean dash formatting
  }

  removeBoilerplate(text) {
    let output = text;

    // Remove page numbers like "Page 1", "Page 2"
    output = output.replace(/Page\s+\d+/gi, "");

    // Remove headers like "Company Confidential", "Footer text", etc.
    const boilerplatePatterns = [
      /copyright\s*\d{4}/gi,
      /all rights reserved/gi,
      /confidential/gi,
      /footer[:\s].*/gi,
      /header[:\s].*/gi,
    ];

    boilerplatePatterns.forEach((pattern) => {
      output = output.replace(pattern, "");
    });

    return output;
  }

  normalizeWhitespace(text) {
    return text
      .replace(/\r/g, "")
      .replace(/\t+/g, " ")
      .replace(/ +/g, " ") // multiple → one space
      .replace(/\n{2,}/g, "\n"); // multiple newlines → single
  }
}

export default new PreprocessingService();
