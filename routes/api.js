import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractFrames } from '../services/videoService.js';
import { addTimestamps } from '../services/imageService.js';
import { generateMarkdown } from '../services/openaiService.js';
import { removeMarkdownCodeBlockDelimiters } from '../utils/textSanitizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: '動画ファイルが選択されていません。',
    });
  }

  const sessionId = uuidv4();
  const exportDir = path.join(__dirname, '..', 'export', sessionId);
  const imagesDir = path.join(exportDir, 'images');
  const videoPath = req.file.path;

  try {
    await fs.mkdir(imagesDir, { recursive: true });

    const frames = await extractFrames(videoPath, imagesDir);
    const imagesWithTimestamps = await addTimestamps(frames, imagesDir);
    const rawMarkdown = await generateMarkdown(imagesWithTimestamps);
    const markdown = removeMarkdownCodeBlockDelimiters(rawMarkdown);
    
    const manualPath = path.join(exportDir, 'manual.md');
    await fs.writeFile(manualPath, markdown, 'utf-8');

    const imageUrls = imagesWithTimestamps.map(img => `images/${img.filename}`);

    await fs.unlink(videoPath);

    res.json({
      markdown,
      images: imageUrls,
      sessionId,
    });
  } catch (error) {
    console.error('Error:', error);
    
    try {
      await fs.rm(exportDir, { recursive: true, force: true });
      await fs.unlink(videoPath).catch(() => {});
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(500).json({
      error: '変換に失敗しました。動画を短くして再実行してください。',
    });
  }
});

export default router;

