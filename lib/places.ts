import "server-only";

import { prisma } from "@/lib/prisma";
import { rankPlaces } from "@/lib/place-ranking";
import { extractSearchIntent } from "@/lib/search-intent-service";
import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

const placeSelect = {
  id: true,
  name: true,
  category: true,
  tags: true,
  rating: true,
  priceLevel: true,
  image: true,
  description: true,
  address: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} as const;

const DEFAULT_PAGE_SIZE = 24;

export type SearchPlacesOptions = {
  page?: number;
  pageSize?: number;
  category?: string;
  price?: string;
  sort?: string;
};

export type SearchPlacesResult = {
  places: Place[];
  intent: SearchIntent | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type PlaceRecord = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number | null;
  priceLevel: string | null;
  image: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

function toPlace(place: PlaceRecord): Place | undefined {
  if (place.latitude === null || place.longitude === null) {
    return undefined;
  }

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    tags: place.tags ?? [],
    rating: place.rating !== null && place.rating > 0 ? place.rating : null,
    priceLevel: place.priceLevel,
    distance: null,
    image: place.image,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function parseDistance(distance: string | null): number {
  if (!distance) return Number.POSITIVE_INFINITY;

  const value = Number.parseFloat(distance);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function sortPlaces(places: Place[], sort: string): Place[] {
  const sorted = [...places];

  if (sort === "rating") {
    return sorted.sort(
      (a, b) =>
        (b.rating ?? Number.NEGATIVE_INFINITY) -
        (a.rating ?? Number.NEGATIVE_INFINITY),
    );
  }

  if (sort === "distance") {
    return sorted.sort(
      (a, b) => parseDistance(a.distance) - parseDistance(b.distance),
    );
  }

  return sorted;
}

function buildBaseWhere(category?: string, price?: string) {
  return {
    latitude: { not: null },
    longitude: { not: null },
    ...(category && category !== "All" ? { category } : {}),
    ...(price && price !== "all" ? { priceLevel: price } : {}),
  };
}

export async function getPlaces(): Promise<Place[]> {
  const records = await prisma.place.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: placeSelect,
    orderBy: { createdAt: "desc" },
  });

  return records.flatMap((record) => {
    const place = toPlace(record);
    return place ? [place] : [];
  });
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  const record = await prisma.place.findUnique({
    where: { id },
    select: placeSelect,
  });

  if (!record) return undefined;

  return toPlace(record);
}

export async function searchPlaces(
  query: string,
  options: SearchPlacesOptions = {},
): Promise<SearchPlacesResult> {
  const normalizedQuery = query.trim();
  const pageSize = Math.min(
    Math.max(Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE), 1),
    100,
  );
  const page = Math.max(Math.floor(options.page ?? 1), 1);
  const skip = (page - 1) * pageSize;
  const category = options.category ?? "All";
  const price = options.price ?? "all";
  const sort = options.sort ?? "recommended";

  const baseWhere = buildBaseWhere(category, price);

  if (!normalizedQuery) {
    const totalCount = await prisma.place.count({ where: baseWhere });

    const orderBy =
      sort === "rating"
        ? [
            { rating: { sort: "desc" as const, nulls: "last" as const } },
            { createdAt: "desc" as const },
          ]
        : [{ createdAt: "desc" as const }];

    const records = await prisma.place.findMany({
      where: baseWhere,
      select: placeSelect,
      orderBy,
      skip,
      take: pageSize,
    });

    const places = records.flatMap((record) => {
      const place = toPlace(record);
      return place ? [place] : [];
    });

    return {
      places: sort === "distance" ? sortPlaces(places, sort) : places,
      intent: null,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  const intent = await extractSearchIntent(normalizedQuery);

  const intentWhere = {
    ...(intent.category ? { category: intent.category } : {}),
    ...(intent.priceLevel ? { priceLevel: intent.priceLevel } : {}),
  };

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  const where = {
    ...baseWhere,
    ...intentWhere,
    ...(!intent.category && !intent.priceLevel
      ? {
          OR: [
            ...queryTerms.flatMap((term) => [
              { name: { contains: term, mode: "insensitive" as const } },
              { category: { contains: term, mode: "insensitive" as const } },
              { description: { contains: term, mode: "insensitive" as const } },
              { address: { contains: term, mode: "insensitive" as const } },
            ]),
            ...(intent.tags.length > 0
              ? [{ tags: { hasSome: intent.tags } }]
              : []),
          ],
        }
      : {}),
  };

  const records = await prisma.place.findMany({
    where,
    select: placeSelect,
    orderBy: { createdAt: "desc" },
  });

  const candidates = records.flatMap((record) => {
    const place = toPlace(record);
    return place ? [place] : [];
  });

  const rankedPlaces = sortPlaces(rankPlaces(candidates, intent), sort);

  const totalCount = rankedPlaces.length;

  return {
    places: rankedPlaces.slice(skip, skip + pageSize),
    intent,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function getPlaceCategories(): Promise<string[]> {
  const records = await prisma.place.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return records.map((place) => place.category);
}
