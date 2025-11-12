import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { formatTimestamp } from '../utils/timestamp.js';
import { TIMESTAMP_OVERLAY } from '../config/image.js';

export async function addTimestamps(frames, imagesDir) {
  const processedFrames = [];

  for (const frame of frames) {
    const imagePath = path.join(imagesDir, frame.filename);
    const imageBuffer = await fs.readFile(imagePath);
    
    const metadata = await sharp(imageBuffer).metadata();
    const timestampText = formatTimestamp(frame.timestamp);
    
    const {
      fontFamily,
      fontSize,
      fontWeight,
      textColor,
      boxColor,
      paddingX,
      paddingY,
      margin,
      approxCharWidthFactor,
    } = TIMESTAMP_OVERLAY;
    const approxCharWidth = fontSize * approxCharWidthFactor;
    const textWidth = Math.round(approxCharWidth * timestampText.length);
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;
    const rectX = margin;
    const rectY = metadata.height - boxHeight - margin;
    const textX = rectX + paddingX;
    const textY = rectY + boxHeight - paddingY;
    
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <rect x="${rectX}" y="${rectY}" width="${boxWidth}" height="${boxHeight}" fill="${boxColor}" />
        <text
          x="${textX}"
          y="${textY}"
          font-family="${fontFamily}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}"
        >${timestampText}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svg);
    
    const processedImage = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 85 })
      .toBuffer();

    await fs.writeFile(imagePath, processedImage);

    processedFrames.push({
      ...frame,
      imageBuffer: processedImage,
    });
  }

  return processedFrames;
}

