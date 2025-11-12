import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static('public'));
app.use('/export', express.static('export'));

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: '動画ファイルが選択されていません。',
    });
  }

  const sessionId = uuidv4();
  const exportDir = path.join(__dirname, 'export', sessionId);
  const imagesDir = path.join(exportDir, 'images');
  const videoPath = req.file.path;

  try {
    await fs.mkdir(imagesDir, { recursive: true });

    const frames = await extractFrames(videoPath, imagesDir);
    const imagesWithTimestamps = await addTimestamps(frames, imagesDir);
    const markdown = await generateMarkdown(imagesWithTimestamps);
    
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

async function extractFrames(videoPath, outputDir) {
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

async function addTimestamps(frames, imagesDir) {
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

function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function generateMarkdown(frames) {
  const imageContents = await Promise.all(
    frames.map(async (frame) => {
      const base64 = frame.imageBuffer.toString('base64');
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
        },
      };
    })
  );

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `これらの画像は動画から抽出されたフレームです。各画像の左下にタイムスタンプ（MM:SS形式）が表示されています。

以下の形式でMarkdownマニュアルを生成してください：

1. ステップ見出し（Step 1, Step 2, ...）
2. 各ステップに1-2枚の代表画像を埋め込み（画像内のタイムスタンプを参照）
3. 各ステップの開始〜終了時刻を画像内のタイムスタンプを読んで記載（例：00:15 - 00:30）
4. 最後に注意事項セクションを追加

画像の参照は相対パスで行ってください（例：images/frame-00001.jpg）。`,
        },
        ...imageContents,
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

