/**
 * AIが生成したテキストから先頭と末尾の```マークダウンブロック記号を削除する
 * @param {string} text - 処理対象のテキスト
 * @returns {string} - 処理後のテキスト
 */
export function removeMarkdownCodeBlockDelimiters(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let processed = text.trim();

  // 先頭が```で始まる場合（```markdownや```mdなどの言語指定も含む）
  if (processed.startsWith('```')) {
    const firstNewlineIndex = processed.indexOf('\n');
    if (firstNewlineIndex !== -1) {
      processed = processed.substring(firstNewlineIndex + 1);
    } else {
      // 改行がない場合は```だけを削除
      processed = processed.replace(/^```[a-z]*\s*/, '');
    }
  }

  // 末尾が```で終わる場合
  if (processed.endsWith('```')) {
    const lastNewlineIndex = processed.lastIndexOf('\n');
    if (lastNewlineIndex !== -1) {
      processed = processed.substring(0, lastNewlineIndex);
    } else {
      // 改行がない場合は```だけを削除
      processed = processed.replace(/\s*```$/, '');
    }
  }

  return processed.trim();
}

/**
 * Markdown内の相対画像パスをセッション固有の絶対パスに書き換える
 * - 画像記法: ![alt](./mm-ss.jpg) または ![alt](mm-ss.jpg) → ![alt](/export/{sessionId}/images/mm-ss.jpg)
 * - HTML記法: <img src="./mm-ss.jpg"> → <img src="/export/{sessionId}/images/mm-ss.jpg">
 * - mm-ss形式（例: 00-00.jpg）の画像パスを全て置換
 * @param {string} markdown - 変換対象のMarkdown文字列
 * @param {string} sessionId - セッションID
 * @returns {string} - 変換後のMarkdown
 */
export function rewriteRelativeImagePaths(markdown, sessionId) {
  if (!markdown || typeof markdown !== 'string' || !sessionId) {
    return markdown;
  }

  const exportPrefix = `/export/${sessionId}/images/`;

  let result = markdown;

  // Markdown画像・リンク: ![...](./mm-ss.jpg) または ![...](mm-ss.jpg) の形式を検出
  // mm-ss形式: 2桁-2桁のパターン（例: 00-00.jpg）
  result = result.replace(
    /(!?\[[^\]]*\]\()(\.?\/?)(\d{2}-\d{2}\.[a-zA-Z]+)(\))/g,
    (_m, p1, p2, filename, p4) => `${p1}${exportPrefix}${filename}${p4}`
  );

  // HTML imgタグ: <img src="./mm-ss.jpg"> または <img src="mm-ss.jpg"> の形式を検出
  result = result.replace(
    /(<img\b[^>]*\bsrc=["'])(\.?\/?)(\d{2}-\d{2}\.[a-zA-Z]+)(["'][^>]*>)/gi,
    (_m, p1, p2, filename, p4) => `${p1}${exportPrefix}${filename}${p4}`
  );

  return result;
}

