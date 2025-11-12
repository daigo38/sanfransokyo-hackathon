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
 * Markdown内の相対画像パス（images/..）をセッション固有の絶対パスに書き換える
 * - 画像記法: ![alt](images/xx.jpg) → ![alt](/export/{sessionId}/images/xx.jpg)
 * - HTML記法: <img src="images/xx.jpg"> → <img src="/export/{sessionId}/images/xx.jpg">
 * - 通常リンク: [text](images/xx.jpg) も同様に書き換え
 * @param {string} markdown - 変換対象のMarkdown文字列
 * @param {string} sessionId - セッションID
 * @returns {string} - 変換後のMarkdown
 */
export function rewriteRelativeImagePaths(markdown, sessionId) {
  if (!markdown || typeof markdown !== 'string' || !sessionId) {
    return markdown;
  }

  // images/ で始まる相対パスを /export/{sessionId}/ でプレフィックス
  const exportPrefix = `/export/${sessionId}/`;

  let result = markdown;

  // Markdown画像・リンク: ![...](images/...) および [...](images/...)
  result = result.replace(
    /(!?\[[^\]]*\]\()(images\/[^)]+)(\))/g,
    (_m, p1, rel, p3) => `${p1}${exportPrefix}${rel}${p3}`
  );

  // HTML imgタグ
  result = result.replace(
    /(<img\b[^>]*\bsrc=["'])(images\/[^"']+)(["'][^>]*>)/gi,
    (_m, p1, rel, p3) => `${p1}${exportPrefix}${rel}${p3}`
  );

  return result;
}

