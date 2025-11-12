export const TIMESTAMP_OVERLAY = {
  // タイムスタンプ注記の視認性を確保するための描画パラメータ。
  // 画像の内容が多様でも安定して読めることを目的に、背景と文字色を固定し、
  // フォントサイズと余白は実測に依存しない静的値で構成している。
  fontFamily: 'Arial, sans-serif',
  fontSize: 24,
  fontWeight: 'bold',
  textColor: 'white',
  boxColor: 'black',
  paddingX: 12,
  paddingY: 8,
  margin: 8,
  // SVGのテキスト幅推定のための係数。フォント依存のため厳密ではないが、
  // 実用上のレイアウトずれを最小化できる経験則に基づく近似値。
  approxCharWidthFactor: 0.6,
};


