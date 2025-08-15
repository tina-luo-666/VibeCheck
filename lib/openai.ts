import OpenAI from "openai";
import { env } from "./env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateStoreSpec(prompt: string) {
  const startTime = Date.now();
  console.log(
    `[OpenAI] Starting store spec generation for prompt: "${prompt}"`
  );

  try {
    console.log(`[OpenAI] Calling GPT-4 for store spec generation...`);
    const apiCallStartTime = Date.now();

    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a store generator that creates JSON specifications for e-commerce pop-up stores.

IMPORTANT: Return ONLY valid JSON that matches this exact schema:

{
  "name": "string (max 48 chars)",
  "description": "string (max 155 chars)",
  "hero": {
    "title": "string (max 60 chars)",
    "subtitle": "string (max 120 chars)",
    "imageUrl": "https://placeholder.com/image.jpg (use this exact placeholder)"
  },
  "products": [
    {
      "name": "string (max 40 chars)",
      "description": "string (max 200 chars)",
      "price": number (1500-8900 cents, $15-$89),
      "imagePrompt": "string"
    }
  ],
  "theme": {
    "primaryColor": "string (hex color like #FF6B6B)",
    "fontFamily": "string (must be exactly 'inter', 'playfair', or 'poppins')",
    "style": "string (must be exactly 'minimal', 'bold', or 'organic')"
  },
  "faq": [
    {
      "question": "string (max 100 chars)",
      "answer": "string (max 300 chars)"
    }
  ]
}

Requirements:
- Create 3-5 products
- Create 3-5 FAQ items
- Use trendy, giftable products
- Price products between $15-$89 (1500-8900 cents)
- Use hex colors (e.g., #FF6B6B)
- Font family must be exactly 'inter', 'playfair', or 'poppins'
- Style must be exactly 'minimal', 'bold', or 'organic'
- Keep all strings within their character limits
- Always use "https://placeholder.com/image.jpg" for hero.imageUrl`,
          },
          {
            role: "user",
            content: `Create a pop-up store for: "${prompt}"`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      },
      {
        timeout: 60000, // 60 second timeout
      }
    );

    const apiCallTime = Date.now() - apiCallStartTime;
    console.log(`[OpenAI] GPT-4 API call completed in ${apiCallTime}ms`);

    const content = completion.choices[0].message.content;
    console.log(
      `[OpenAI] Received response content (${content?.length || 0} chars)`
    );

    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    console.log(`[OpenAI] Parsing JSON response...`);
    const parseStartTime = Date.now();
    const parsed = JSON.parse(content);
    const parseTime = Date.now() - parseStartTime;
    console.log(`[OpenAI] JSON parsing completed in ${parseTime}ms`);

    console.log(`[OpenAI] Store spec generated successfully:`, {
      name: parsed.name,
      productsCount: parsed.products?.length,
      faqCount: parsed.faq?.length,
      theme: parsed.theme,
    });

    const totalTime = Date.now() - startTime;
    console.log(`[OpenAI] Store spec generation total time: ${totalTime}ms`);

    return parsed;
  } catch (error: unknown) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[OpenAI] Store spec generation error after ${totalTime}ms:`,
      error
    );

    const err = error as { code?: string; status?: number; message?: string };
    if (err.code === "timeout") {
      console.error(`[OpenAI] Request timed out after ${totalTime}ms`);
    } else if (err.status) {
      console.error(
        `[OpenAI] API error with status ${err.status}: ${err.message}`
      );
    }

    throw error;
  }
}

export async function generateProductImage(prompt: string): Promise<string> {
  const startTime = Date.now();
  console.log(`[OpenAI] Starting image generation for prompt: "${prompt}"`);

  try {
    console.log(`[OpenAI] Calling DALL-E 3 for image generation...`);
    const apiCallStartTime = Date.now();

    const fullPrompt = `Professional product photo: ${prompt}, clean white background, high quality, commercial photography, well-lit, centered`;
    console.log(`[OpenAI] Full DALL-E prompt: "${fullPrompt}"`);

    const response = await openai.images.generate(
      {
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      },
      {
        timeout: 120000, // 2 minute timeout for image generation
      }
    );

    const apiCallTime = Date.now() - apiCallStartTime;
    console.log(`[OpenAI] DALL-E 3 API call completed in ${apiCallTime}ms`);

    const url = response.data?.[0]?.url;
    console.log(`[OpenAI] Generated image URL: ${url ? "received" : "empty"}`);

    if (!url) {
      throw new Error("OpenAI returned empty image URL");
    }

    const totalTime = Date.now() - startTime;
    console.log(`[OpenAI] Image generation total time: ${totalTime}ms`);

    return url;
  } catch (error: unknown) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[OpenAI] Image generation error after ${totalTime}ms:`,
      error
    );

    const err = error as { code?: string; status?: number; message?: string };
    if (err.code === "timeout") {
      console.error(`[OpenAI] Image generation timed out after ${totalTime}ms`);
    } else if (err.status) {
      console.error(
        `[OpenAI] DALL-E API error with status ${err.status}: ${err.message}`
      );
    } else if (err.code === "content_policy_violation") {
      console.error(
        `[OpenAI] Content policy violation for prompt: "${prompt}"`
      );
    }

    throw error;
  }
}
