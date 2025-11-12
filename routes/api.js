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
import { removeMarkdownCodeBlockDelimiters, rewriteRelativeImagePaths } from '../utils/textSanitizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/sessions', async (req, res) => {
  try {
    const exportDir = path.join(__dirname, '..', 'export');
    const entries = await fs.readdir(exportDir, { withFileTypes: true });
    
    const sessions = await Promise.all(
      entries
        .filter(entry => entry.isDirectory())
        .map(async (entry) => {
          const sessionId = entry.name;
          const sessionDir = path.join(exportDir, sessionId);
          const manualPath = path.join(sessionDir, 'manual.md');
          
          try {
            const stats = await fs.stat(manualPath);
            return {
              sessionId,
              createdAt: stats.birthtime,
            };
          } catch {
            return null;
          }
        })
    );

    const validSessions = sessions
      .filter(session => session !== null)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ sessions: validSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: 'Failed to retrieve session list.',
    });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const exportDir = path.join(__dirname, '..', 'export', sessionId);
    const manualPath = path.join(exportDir, 'manual.md');
    const imagesDir = path.join(exportDir, 'images');

    const markdown = await fs.readFile(manualPath, 'utf-8');
    const imageFiles = await fs.readdir(imagesDir);
    const images = imageFiles
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      .sort()
      .map(file => `images/${file}`);

    res.json({
      sessionId,
      markdown,
      images,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(404).json({
      error: 'Session not found.',
    });
  }
});

router.post('/generate-manual-from-video', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  if (!req.file) {
    console.log('[Generation] Error: No video file selected');
    return res.status(400).json({
      error: 'No video file selected.',
    });
  }

  const language = req.body.language || 'English';
  const sessionId = uuidv4();
  const exportDir = path.join(__dirname, '..', 'export', sessionId);
  const imagesDir = path.join(exportDir, 'images');
  const videoPath = req.file.path;

  console.log(`[Generation] Started: sessionId=${sessionId}, videoFile=${req.file.originalname}, size=${req.file.size} bytes, language=${language}`);

  try {
    await fs.mkdir(imagesDir, { recursive: true });
    console.log(`[Generation] Directory created: ${imagesDir}`);

    console.log(`[Generation] Frame extraction started: ${videoPath}`);
    const frameExtractStartTime = Date.now();
    const frames = await extractFrames(videoPath, imagesDir);
    const frameExtractDuration = Date.now() - frameExtractStartTime;
    console.log(`[Generation] Frame extraction completed: ${frames.length} frames, duration=${frameExtractDuration}ms`);

    console.log(`[Generation] Timestamp addition started: ${frames.length} frames`);
    const timestampStartTime = Date.now();
    const imagesWithTimestamps = await addTimestamps(frames, imagesDir);
    const timestampDuration = Date.now() - timestampStartTime;
    console.log(`[Generation] Timestamp addition completed: ${imagesWithTimestamps.length} images, duration=${timestampDuration}ms`);

    console.log(`[Generation] Markdown generation started: sending ${imagesWithTimestamps.length} images, language=${language}`);
    const markdownStartTime = Date.now();
    const rawMarkdown = await generateMarkdown(imagesWithTimestamps, language);
    const markdownDuration = Date.now() - markdownStartTime;
    console.log(`[Generation] Markdown generation completed: ${rawMarkdown.length} characters, duration=${markdownDuration}ms`);

    const sanitized = removeMarkdownCodeBlockDelimiters(rawMarkdown);
    const markdown = rewriteRelativeImagePaths(sanitized, sessionId);
    
    const manualPath = path.join(exportDir, 'manual.md');
    await fs.writeFile(manualPath, markdown, 'utf-8');
    console.log(`[Generation] Manual file saved: ${manualPath}`);

    const imageUrls = imagesWithTimestamps.map(img => `images/${img.filename}`);

    await fs.unlink(videoPath);
    console.log(`[Generation] Temporary file deleted: ${videoPath}`);

    const totalDuration = Date.now() - startTime;
    console.log(`[Generation] Completed: sessionId=${sessionId}, totalDuration=${totalDuration}ms, imageCount=${imageUrls.length}`);

    res.json({
      markdown,
      images: imageUrls,
      sessionId,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Generation] Error occurred: sessionId=${sessionId}, duration=${totalDuration}ms`, error);
    console.error(`[Generation] Error details:`, {
      message: error.message,
      stack: error.stack,
    });
    
    try {
      await fs.rm(exportDir, { recursive: true, force: true });
      await fs.unlink(videoPath).catch(() => {});
      console.log(`[Generation] Cleanup completed: ${exportDir}`);
    } catch (cleanupError) {
      console.error('[Generation] Cleanup error:', cleanupError);
    }

    res.status(500).json({
      error: 'Conversion failed. Please try again with a shorter video.',
    });
  }
});

export default router;

