import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';

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
        
        const framesWithTimestamps = imageFiles.map((filename, index) => ({
          filename,
          timestamp: index,
        }));
        
        resolve(framesWithTimestamps);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

