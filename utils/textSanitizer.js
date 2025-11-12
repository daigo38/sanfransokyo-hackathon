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

