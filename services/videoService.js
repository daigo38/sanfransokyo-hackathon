import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';
import { formatTimestampForFilename } from '../utils/timestamp.js';

ffmpeg.setFfmpegPath(ffmpegStatic);

export async function extractFrames(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', 'fps=1,scale=512:-1',
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
          const timestamp = index;
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

