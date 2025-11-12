/**
 * Removes markdown code block delimiters (```) from the beginning and end of AI-generated text
 * @param {string} text - Text to process
 * @returns {string} - Processed text
 */
export function removeMarkdownCodeBlockDelimiters(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let processed = text.trim();

  // If it starts with ``` (including language specifiers like ```markdown or ```md)
  if (processed.startsWith('```')) {
    const firstNewlineIndex = processed.indexOf('\n');
    if (firstNewlineIndex !== -1) {
      processed = processed.substring(firstNewlineIndex + 1);
    } else {
      // If there's no newline, just remove the ```
      processed = processed.replace(/^```[a-z]*\s*/, '');
    }
  }

  // If it ends with ```
  if (processed.endsWith('```')) {
    const lastNewlineIndex = processed.lastIndexOf('\n');
    if (lastNewlineIndex !== -1) {
      processed = processed.substring(0, lastNewlineIndex);
    } else {
      // If there's no newline, just remove the ```
      processed = processed.replace(/\s*```$/, '');
    }
  }

  return processed.trim();
}

/**
 * Rewrites relative image paths in Markdown to session-specific absolute paths
 * - Image syntax: ![alt](./mm-ss.jpg) or ![alt](mm-ss.jpg) → ![alt](/export/{sessionId}/images/mm-ss.jpg)
 * - HTML syntax: <img src="./mm-ss.jpg"> → <img src="/export/{sessionId}/images/mm-ss.jpg">
 * - Replaces all image paths in mm-ss format (e.g., 00-00.jpg)
 * @param {string} markdown - Markdown string to convert
 * @param {string} sessionId - Session ID
 * @returns {string} - Converted Markdown
 */
export function rewriteRelativeImagePaths(markdown, sessionId) {
  if (!markdown || typeof markdown !== 'string' || !sessionId) {
    return markdown;
  }

  const exportPrefix = `/export/${sessionId}/images/`;

  let result = markdown;

  // Markdown images/links: Detect ![...](./mm-ss.jpg) or ![...](mm-ss.jpg) format
  // mm-ss format: 2-digit-2-digit pattern (e.g., 00-00.jpg)
  result = result.replace(
    /(!?\[[^\]]*\]\()(\.?\/?)(\d{2}-\d{2}\.[a-zA-Z]+)(\))/g,
    (_m, p1, p2, filename, p4) => `${p1}${exportPrefix}${filename}${p4}`
  );

  // HTML img tags: Detect <img src="./mm-ss.jpg"> or <img src="mm-ss.jpg"> format
  result = result.replace(
    /(<img\b[^>]*\bsrc=["'])(\.?\/?)(\d{2}-\d{2}\.[a-zA-Z]+)(["'][^>]*>)/gi,
    (_m, p1, p2, filename, p4) => `${p1}${exportPrefix}${filename}${p4}`
  );

  return result;
}
