import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';
import { formatTimestampForFilename } from '../utils/timestamp.js';
import { FRAME_EXTRACTION } from '../config/video.js';

ffmpeg.setFfmpegPath(ffmpegStatic);

export async function extractFrames(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const intervalSeconds = FRAME_EXTRACTION?.intervalSeconds ?? 1;
    const fpsValue = 1 / Math.max(intervalSeconds, 0.0001);
    const fpsArg = Number.isInteger(fpsValue)
      ? String(fpsValue)
      : `${fpsValue}`;
    const filter = `fps=${fpsArg},scale=512:-1`;
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', filter,
        '-q:v', '3',
      ])
      .output(path.join(outputDir, 'frame-%05d.jpg'))
      .on('end', async () => {
        const files = await fs.readdir(outputDir);
        const imageFiles = files
          .filter(f => f.startsWith('frame-') && f.endsWith('.jpg'))
          .sort();
        
        const framesWithTimestamps = [];
        
        for (let index = 0; index < imageFiles.length; index++) {
          const oldFilename = imageFiles[index];
          const timestamp = Math.round(index * intervalSeconds);
          const newFilename = `${formatTimestampForFilename(timestamp)}.jpg`;
          const oldPath = path.join(outputDir, oldFilename);
          const newPath = path.join(outputDir, newFilename);
          
          await fs.rename(oldPath, newPath);
          
          framesWithTimestamps.push({
            filename: newFilename,
            timestamp,
          });
        }
        
        resolve(framesWithTimestamps);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

