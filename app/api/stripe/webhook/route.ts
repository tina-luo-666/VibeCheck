import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    // Allow webhook to work without signature for local development
    if (!signature && !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log(
        "No signature provided, but webhook secret is also not set - allowing for local dev"
      );
    } else if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const event = await handleWebhook(body, signature || "");

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: error.message || "Webhook failed" },
      { status: 400 }
    );
  }
}
