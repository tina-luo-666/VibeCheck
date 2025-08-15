import { NextRequest, NextResponse } from "next/server";
import { generateFromPrompt } from "@/lib/orchestrator";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  console.log(
    `[${requestId}] Starting generation request at ${new Date().toISOString()}`
  );

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const { prompt, allowIp = false } = await request.json();
    console.log(
      `[${requestId}] Request parsed. Prompt: "${prompt}", allowIp: ${allowIp}`
    );

    if (!prompt || typeof prompt !== "string") {
      console.log(`[${requestId}] Invalid prompt provided`);
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // Get IP for logging (rate limiting removed)
    console.log(`[${requestId}] Getting client IP...`);
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    console.log(
      `[${requestId}] Client IP: ${ip} (Redis rate limiting disabled)`
    );

    console.log(
      `[${requestId}] Proceeding directly to generation (no Redis caching/rate limiting)`
    );

    // Generate store
    console.log(`[${requestId}] Starting generation for prompt: "${prompt}"`);
    const generationStartTime = Date.now();
    const result = await generateFromPrompt(prompt, allowIp, ip, requestId);
    const generationTime = Date.now() - generationStartTime;
    console.log(
      `[${requestId}] Generation completed successfully in ${generationTime}ms:`,
      result
    );

    // Redis caching removed for simplicity

    const totalTime = Date.now() - startTime;
    console.log(
      `[${requestId}] Request completed successfully in ${totalTime}ms total`
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    const totalTime = Date.now() - startTime;
    console.error(
      `[${requestId}] Generation error after ${totalTime}ms:`,
      error
    );
    console.error(
      `[${requestId}] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace available"
    );

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Content blocked")) {
      console.log(`[${requestId}] Content moderation blocked the request`);
      return NextResponse.json(
        { error: errorMessage, type: "moderation" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Generation failed",
        details: errorMessage,
        requestId: requestId,
      },
      { status: 500 }
    );
  }
}
