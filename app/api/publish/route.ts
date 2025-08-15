import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("stores")
      .update({ status: "published" })
      .eq("id", storeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Publish error:", error);

    return NextResponse.json(
      { error: error.message || "Publish failed" },
      { status: 500 }
    );
  }
}
