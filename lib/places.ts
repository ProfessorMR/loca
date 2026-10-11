import "server-only";

import { prisma } from "@/lib/prisma";
import { rankPlaces } from "@/lib/place-ranking";
import { extractSearchIntent } from "@/lib/search-intent-service";
import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

export async function getPlaces(): Promise<Place[]> {
  const records = await prisma.place.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    tags: place.tags,
    rating: place.rating > 0 ? place.rating : null,
    priceLevel: place.priceLevel,
    distance: null,
    image: place.image,
    description: place.description,
    address: place.address,
    latitude: place.latitude!,
    longitude: place.longitude!,
  }));
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  const place = await prisma.place.findUnique({
    where: { id },
  });

  if (!place || place.latitude === null || place.longitude === null) {
    return undefined;
  }

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    tags: place.tags,
    rating: place.rating > 0 ? place.rating : null,
    priceLevel: place.priceLevel,
    distance: null,
    image: place.image,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export async function searchPlaces(
  query: string,
): Promise<{ places: Place[]; intent: SearchIntent | null }> {
  const availablePlaces = await getPlaces();
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      places: availablePlaces,
      intent: null,
    };
  }

  const intent = await extractSearchIntent(normalizedQuery);

  return {
    places: rankPlaces(availablePlaces, intent),
    intent,
  };
}

export async function getPlaceCategories(): Promise<string[]> {
  const records = await prisma.place.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      category: true,
    },
    distinct: ["category"],
    orderBy: {
      category: "asc",
    },
  });

  return records.map((place) => place.category);
}
