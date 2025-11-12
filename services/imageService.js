import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { formatTimestamp } from '../utils/timestamp.js';

export async function addTimestamps(frames, imagesDir) {
  const processedFrames = [];

  for (const frame of frames) {
    const imagePath = path.join(imagesDir, frame.filename);
    const imageBuffer = await fs.readFile(imagePath);
    
    const metadata = await sharp(imageBuffer).metadata();
    const timestampText = formatTimestamp(frame.timestamp);
    
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <text
          x="8"
          y="${metadata.height - 8}"
          font-family="Arial, sans-serif"
          font-size="24"
          font-weight="bold"
          fill="white"
          stroke="black"
          stroke-width="2"
          stroke-linejoin="round"
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

