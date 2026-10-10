import { NextResponse } from "next/server";
import { aiIntentExtractor } from "@/lib/ai-intent-extractor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "quiet cafe for working";

  try {
    const intent = await aiIntentExtractor.extract(query);

    return NextResponse.json({
      success: true,
      query,
      intent,
    });
  } catch (error) {
    console.error("AI test failed:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error cause:", error.cause);
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown AI error",
      },
      { status: 502 },
    );
  }
}
