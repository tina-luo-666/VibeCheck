import OpenAI from "openai";
import { env } from "./env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const BLOCKED_TERMS = ["gun", "drugs"];

export async function moderatePrompt(prompt: string, allowIp = false) {
  const startTime = Date.now();
  console.log(
    `[Moderation] Starting moderation for prompt: "${prompt}", allowIp: ${allowIp}`
  );

  // Quick IP check first
  if (!allowIp) {
    console.log(`[Moderation] Checking for blocked terms...`);
    const lowerPrompt = prompt.toLowerCase();
    const blockedTerm = BLOCKED_TERMS.find((term) =>
      lowerPrompt.includes(term)
    );

    if (blockedTerm) {
      console.log(`[Moderation] Blocked term detected: "${blockedTerm}"`);
      return {
        allowed: false,
        reason: "potential_ip",
        suggestions: [
          "Try describing the aesthetic or style instead of brand names",
          "Focus on the theme or vibe rather than specific products",
          'Use generic terms like "pop star merch" or "athletic wear"',
        ],
      };
    }
    console.log(`[Moderation] No blocked terms found`);
  }

  // OpenAI moderation
  console.log(`[Moderation] Calling OpenAI moderation API...`);
  const moderationStartTime = Date.now();

  try {
    const moderation = await openai.moderations.create(
      {
        input: prompt,
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    const moderationTime = Date.now() - moderationStartTime;
    console.log(
      `[Moderation] OpenAI moderation completed in ${moderationTime}ms`
    );

    const result = moderation.results[0];
    const flagged = result?.flagged;

    if (flagged) {
      console.log(`[Moderation] Content flagged by OpenAI:`, {
        categories: Object.keys(result.categories).filter(
          (cat) => result.categories[cat]
        ),
        category_scores: result.category_scores,
      });
    } else {
      console.log(`[Moderation] Content approved by OpenAI`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[Moderation] Total moderation time: ${totalTime}ms`);

    return {
      allowed: !flagged,
      reason: flagged ? "content_policy" : null,
      suggestions: flagged
        ? [
            "Please rephrase your request to focus on safe, family-friendly products",
          ]
        : [],
    };
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[Moderation] OpenAI moderation error after ${totalTime}ms:`,
      error
    );

    if (error.code === "timeout") {
      console.error(`[Moderation] Moderation request timed out`);
    }

    throw error;
  }
}
