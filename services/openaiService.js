import { openai } from '../config/openai.js';
import { MANUAL_GENERATION_PROMPT } from '../prompts/manualGeneration.js';

export async function generateMarkdown(frames) {
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
          text: MANUAL_GENERATION_PROMPT,
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

