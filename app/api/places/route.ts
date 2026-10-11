import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Failed to fetch places:", error);

    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}
