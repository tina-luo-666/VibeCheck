import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { productId, qty = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(productId, qty);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
