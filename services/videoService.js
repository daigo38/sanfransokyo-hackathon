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
    
    console.log(`[Frame Extraction] Configuration: video=${videoPath}, output=${outputDir}, interval=${intervalSeconds}s, FPS=${fpsArg}`);
    
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', filter,
        '-q:v', '3',
      ])
      .output(path.join(outputDir, 'frame-%05d.jpg'))
      .on('start', (commandLine) => {
        console.log(`[Frame Extraction] FFmpeg command execution started`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[Frame Extraction] Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', async () => {
        console.log(`[Frame Extraction] FFmpeg processing completed`);
        const files = await fs.readdir(outputDir);
        const imageFiles = files
          .filter(f => f.startsWith('frame-') && f.endsWith('.jpg'))
          .sort();
        
        console.log(`[Frame Extraction] Extracted frames: ${imageFiles.length}`);
        
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
        
        console.log(`[Frame Extraction] Rename completed: ${framesWithTimestamps.length} frames`);
        resolve(framesWithTimestamps);
      })
      .on('error', (err) => {
        console.error(`[Frame Extraction] Error:`, err);
        reject(err);
      })
      .run();
  });
}

