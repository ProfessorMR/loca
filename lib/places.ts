import "server-only";

import { getOpenStatus } from "@/lib/opening-hours";
import { pickPopularTerms } from "@/lib/popular-terms";
import { prisma } from "@/lib/prisma";
import { rankPlaces } from "@/lib/place-ranking";
import { extractSearchIntent } from "@/lib/search-intent-service";
import type { CategoryCount, Place } from "@/types/place";
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
  openingHours: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} as const;

const DEFAULT_PAGE_SIZE = 24;

// No place has a price level yet, so a price word in a search ("cheap") must
// not filter everything out. Flip this once price data exists.
const SUPPORTS_PRICE_FILTER = false;

export type SearchPlacesOptions = {
  page?: number;
  pageSize?: number;
  category?: string;
  /** Only places whose opening hours say they are open right now. */
  openNow?: boolean;
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
  openingHours: string | null;
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
    openingHours: place.openingHours,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function isOpenNow(place: Place, now: Date): boolean {
  const status = getOpenStatus(place.openingHours, now);

  return status?.state === "open" || status?.state === "closing-soon";
}

function buildBaseWhere(category?: string) {
  return {
    latitude: { not: null },
    longitude: { not: null },
    ...(category && category !== "All" ? { category } : {}),
  };
}

function paginate(
  places: Place[],
  intent: SearchIntent | null,
  page: number,
  pageSize: number,
): SearchPlacesResult {
  const skip = (page - 1) * pageSize;

  return {
    places: places.slice(skip, skip + pageSize),
    intent,
    totalCount: places.length,
    page,
    pageSize,
    totalPages: Math.ceil(places.length / pageSize),
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
  const category = options.category ?? "All";
  const openNow = options.openNow ?? false;
  const now = new Date();

  const baseWhere = buildBaseWhere(category);

  // Plain browsing: the database does the paging.
  if (!normalizedQuery && !openNow) {
    const skip = (page - 1) * pageSize;
    const totalCount = await prisma.place.count({ where: baseWhere });

    const records = await prisma.place.findMany({
      where: baseWhere,
      select: placeSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    return {
      places: records.flatMap((record) => {
        const place = toPlace(record);
        return place ? [place] : [];
      }),
      intent: null,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  // "Open now" can't be checked in SQL (hours are free text), so load the
  // places that have hours and filter them here.
  if (!normalizedQuery) {
    const records = await prisma.place.findMany({
      where: { ...baseWhere, openingHours: { not: null } },
      select: placeSelect,
      orderBy: { createdAt: "desc" },
    });

    const open = records.flatMap((record) => {
      const place = toPlace(record);
      return place && isOpenNow(place, now) ? [place] : [];
    });

    return paginate(open, null, page, pageSize);
  }

  const rawIntent = await extractSearchIntent(normalizedQuery);
  const intent: SearchIntent = SUPPORTS_PRICE_FILTER
    ? rawIntent
    : { ...rawIntent, priceLevel: undefined };

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

  const ranked = rankPlaces(candidates, intent);
  const visible = openNow
    ? ranked.filter((place) => isOpenNow(place, now))
    : ranked;

  return paginate(visible, intent, page, pageSize);
}

/** Every category that really exists in the data, with its number of places. */
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const groups = await prisma.place.groupBy({
    by: ["category"],
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    _count: { _all: true },
  });

  return groups
    .map((group) => ({ name: group.category, count: group._count._all }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * A few places with complete listings (hours, phone, website, address) so the
 * home page cards look rich, mixed across categories.
 */
export async function getFeaturedPlaces(perCategory = 2): Promise<Place[]> {
  const categories = (await getCategoryCounts()).slice(0, 4);

  const groups = await Promise.all(
    categories.map(async ({ name }) => {
      const records = await prisma.place.findMany({
        where: {
          ...buildBaseWhere(name),
          openingHours: { not: null },
          phone: { not: null },
          website: { not: null },
          address: { not: null },
        },
        select: placeSelect,
        orderBy: { createdAt: "desc" },
        take: perCategory * 10,
      });

      // Skip repeated names so chains (McDonald's, Starbucks...) show once.
      const seen = new Set<string>();

      return records
        .flatMap((record) => {
          const place = toPlace(record);
          return place ? [place] : [];
        })
        .filter((place) => {
          const key = place.name.trim().toLowerCase();
          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        })
        .slice(0, perCategory);
    }),
  );

  // Round-robin so the first cards are not all the same category.
  const mixed: Place[] = [];

  for (let i = 0; i < perCategory; i++) {
    for (const group of groups) {
      if (group[i]) mixed.push(group[i]);
    }
  }

  return mixed;
}

/**
 * Quick-search words taken from the data: food words that really appear in
 * place names, most common first. Words that the search turns into a whole
 * category (like "coffee") are skipped, since categories have their own cards.
 */
export async function getPopularSearchTerms(limit = 6): Promise<string[]> {
  const records = await prisma.place.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { name: true },
  });

  const terms = pickPopularTerms(
    records.map((record) => record.name),
    { limit: limit + 4, minCount: 10 },
  );

  // A term is only a plain name search if it does not map to a category.
  const checked = await Promise.all(
    terms.map(async (term) => {
      const intent = await extractSearchIntent(term.label);
      return intent.category ? null : term.label;
    }),
  );

  return checked
    .filter((label): label is string => label !== null)
    .slice(0, limit);
}
