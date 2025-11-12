export const TIMESTAMP_OVERLAY = {
  // Rendering parameters to ensure timestamp visibility.
  // Fixed background and text colors for stable readability across diverse image content,
  // with font size and padding configured as static values independent of actual measurements.
  fontFamily: 'Arial, sans-serif',
  fontSize: 24,
  fontWeight: 'bold',
  textColor: 'white',
  boxColor: 'black',
  paddingX: 12,
  paddingY: 8,
  margin: 8,
  // Coefficient for SVG text width estimation. Not exact due to font dependency,
  // but an approximation based on empirical rules that minimize practical layout shifts.
  approxCharWidthFactor: 0.6,
};


