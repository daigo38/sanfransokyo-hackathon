# Video to Manual Generation App

A web application that generates timestamp-embedded image sequences from video files and automatically creates Markdown manuals using AI.

## Features

- **Video Upload**: Upload local video files (mp4, etc.)
- **Frame Extraction**: Extract frames at 1fps and automatically resize to 512px width
- **Timestamp Overlay**: Automatically overlay MM:SS format timestamps on the bottom-left of each image
- **AI Manual Generation**: Automatically generate instruction manuals from images using OpenAI API
- **Preview Display**: Preview generated Markdown in the browser
- **File Export**: Save Markdown and images to `export/{sessionId}/` directory

## Requirements

- Node.js 20.19.5 or higher
- npm or yarn
- OpenAI API key

## Installation

```bash
npm install
```

## Setup

1. Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

2. Set your OpenAI API key in `OPENAI_API_KEY`.

## Usage

1. Start the server:

```bash
npm start
```

Development mode (auto-reload on file changes):

```bash
npm run dev
```

2. Access `http://localhost:3000` in your browser

3. Select a video file and click the "Submit" button

4. Once processing is complete, the generated Markdown manual will be displayed on the right side

5. Generated files are saved in the `export/{sessionId}/` directory

## Tech Stack

### Backend
- **Node.js 20.19.5+**: Runtime environment
- **Express**: Web server framework
- **multer**: File upload handling
- **fluent-ffmpeg**: Video processing (frame extraction)
- **ffmpeg-static**: Static FFmpeg binary (no local installation required)
- **sharp**: Image processing (timestamp overlay)
- **OpenAI SDK**: AI API calls
- **dotenv**: Environment variable management

### Frontend
- **HTML/CSS/JavaScript**: Implemented with vanilla JS
- **marked**: Markdown rendering
- **DOMPurify**: XSS protection

## Project Structure

```
.
├── server.js              # Express server and API endpoints
├── public/
│   └── index.html         # Frontend UI
├── export/                # Output directory for generated files
│   └── {sessionId}/
│       ├── images/        # Timestamp-embedded images
│       └── manual.md     # Generated Markdown manual
├── uploads/               # Temporary storage for uploaded videos
├── .env                   # Environment variables (included in .gitignore)
├── package.json
└── README.md
```

## Processing Flow

1. **Video Upload**: Receive video file from client
2. **Session Creation**: Generate unique session ID
3. **Frame Extraction**: Extract frames using FFmpeg at 1fps, resized to 512px width
4. **Timestamp Overlay**: Composite MM:SS format timestamps onto each image using Sharp
5. **AI Processing**: Send timestamp-embedded images to OpenAI API to generate Markdown
6. **File Saving**: Save Markdown and images to `export/{sessionId}/`
7. **Response**: Return generated Markdown and image URLs to client

## Output Specifications

### Directory Structure

```
export/{sessionId}/
├── images/
│   ├── 00-00.jpg    # Timestamp-embedded (00:00)
│   ├── 00-01.jpg    # Timestamp-embedded (00:01)
│   ├── 00-15.jpg    # Timestamp-embedded (00:15)
│   └── ...
└── manual.md        # Markdown manual
```

### Image Specifications

- **Resolution**: 512px width (aspect ratio maintained)
- **Frame Rate**: 1fps
- **Format**: JPEG
- **Filename**: mm-ss format (e.g., `00-15.jpg`)
- **Timestamp**: Bottom-left, white text with black outline, MM:SS format

### Markdown Specifications

- Step headings (Step 1, Step 2, ...)
- Embed 1-2 representative images per step
- Include start and end times for each step
- Images referenced with relative paths (`images/00-15.jpg`, `images/00-30.jpg`, etc., filenames in mm-ss format)

## API

### POST /api/generate-manual-from-video

Upload a video file and generate a manual.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (video file)

**Response**:
```json
{
  "markdown": "Generated Markdown text",
  "images": ["images/00-00.jpg", "images/00-01.jpg", ...],
  "sessionId": "Session ID"
}
```

## Error Handling

- No video file selected: 400 error
- API key not configured: Display error message
- Error during processing: 500 error, session directory automatically deleted

## Notes

- Processing may take time for long videos
- Costs are incurred based on OpenAI API usage
- Generated files are saved in the `export/` directory (please delete manually)

## License

ISC
