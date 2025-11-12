import { openai } from '../config/openai.js';
import { MANUAL_GENERATION_PROMPT } from '../prompts/manualGeneration.js';

export async function generateMarkdown(frames) {
  console.log(`[Markdown Generation] Image encoding started: ${frames.length} images`);
  const encodeStartTime = Date.now();
  
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
  
  const encodeDuration = Date.now() - encodeStartTime;
  console.log(`[Markdown Generation] Image encoding completed: duration=${encodeDuration}ms`);

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

  console.log(`[Markdown Generation] OpenAI API call started: model=gpt-4o, imageCount=${imageContents.length}, promptLength=${MANUAL_GENERATION_PROMPT.length} characters`);
  const apiStartTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 2000,
    });

    const apiDuration = Date.now() - apiStartTime;
    const content = response.choices[0].message.content;
    const tokensUsed = response.usage?.total_tokens || 0;
    
    console.log(`[Markdown Generation] OpenAI API call completed: duration=${apiDuration}ms, tokensUsed=${tokensUsed}, generatedLength=${content.length} characters`);

    return content;
  } catch (error) {
    const apiDuration = Date.now() - apiStartTime;
    console.error(`[Markdown Generation] OpenAI API call error: duration=${apiDuration}ms`, error);
    console.error(`[Markdown Generation] Error details:`, {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    throw error;
  }
}

