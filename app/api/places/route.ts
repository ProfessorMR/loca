import { NextResponse } from "next/server";

import { parseIdList } from "@/lib/place-ids";
import { getPlacesByIds } from "@/lib/places";

// Returns only the places that were asked for. It used to return every place,
// which was slow and let anyone download the whole database.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseIdList(searchParams.get("ids"));

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const places = await getPlacesByIds(parsed.ids);

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Failed to fetch places:", error);

    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}
