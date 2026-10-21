import "server-only";

import { getCategoryLabel } from "@/lib/category-labels";
import { AREAS, haversineKm, formatMiles } from "@/lib/nyc-areas";
import type { Area } from "@/lib/nyc-areas";
import { getOpenStatus, isOpenAt } from "@/lib/opening-hours";
import { FEATURE_TAGS, formatTag, isFeatureTag } from "@/lib/osm-tags";
import { pickPopularTerms } from "@/lib/popular-terms";
import { prisma } from "@/lib/prisma";
import { parseSearchIntent } from "@/lib/search-intent";
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
  phone: true,
  website: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} as const;

const DEFAULT_PAGE_SIZE = 24;

export type SearchPlacesOptions = {
  page?: number;
  pageSize?: number;
  category?: string;
  /** Only places whose opening hours say they are open right now. */
  openNow?: boolean;
  /** Who is searching (an IP address), used to limit AI calls per visitor */
  clientKey?: string;
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
  phone: string | null;
  website: string | null;
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
    phone: place.phone,
    website: place.website,
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

/**
 * Ids of one page of places for plain browsing: the ones with the most
 * information first (opening hours, tags, address), then a stable shuffle so
 * no category or import batch bunches up.
 */
async function getBrowseIds(
  category: string,
  take: number,
  skip: number,
): Promise<string[]> {
  const rows =
    category && category !== "All"
      ? await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Place"
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            AND category = ${category}
          ORDER BY (
            (CASE WHEN "openingHours" IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN cardinality(tags) > 0 THEN 1 ELSE 0 END) +
            (CASE WHEN address IS NOT NULL THEN 1 ELSE 0 END)
          ) DESC, md5(id) ASC
          LIMIT ${take} OFFSET ${skip}`
      : await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Place"
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          ORDER BY (
            (CASE WHEN "openingHours" IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN cardinality(tags) > 0 THEN 1 ELSE 0 END) +
            (CASE WHEN address IS NOT NULL THEN 1 ELSE 0 END)
          ) DESC, md5(id) ASC
          LIMIT ${take} OFFSET ${skip}`;

  return rows.map((row) => row.id);
}

/** The places with these ids, in the same order. Unknown ids are skipped. */
export async function getPlacesByIds(ids: string[]): Promise<Place[]> {
  if (ids.length === 0) return [];

  const records = await prisma.place.findMany({
    where: {
      id: { in: ids },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: placeSelect,
  });

  const byId = new Map<string, Place>();

  for (const record of records) {
    const place = toPlace(record);
    if (place) byId.set(place.id, place);
  }

  return ids.flatMap((id) => {
    const place = byId.get(id);
    return place ? [place] : [];
  });
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

    // Best-documented places first (hours, tags, address), in a stable but
    // shuffled order, so the first page never looks empty.
    const ids = await getBrowseIds(category, pageSize, skip);

    const records = await prisma.place.findMany({
      where: { id: { in: ids } },
      select: placeSelect,
    });

    const byId = new Map(records.map((record) => [record.id, record]));
    const ordered = ids.flatMap((id) => {
      const record = byId.get(id);
      return record ? [record] : [];
    });

    return {
      places: ordered.flatMap((record) => {
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

  const [categoryCounts, areas, vocabulary] = await Promise.all([
    getCategoryCounts(),
    getCoveredAreas(),
    getTagVocabulary(),
  ]);

  const intent = await extractSearchIntent(
    normalizedQuery,
    {
      categories: categoryCounts.map((item) => item.name),
      areas,
      cuisines: vocabulary.cuisines,
      features: vocabulary.features,
    },
    { clientKey: options.clientKey },
  );

  const { intent: finalIntent, results } = await searchWithRelaxation(intent, {
    category,
    openNow,
    now,
  });

  return paginate(results, finalIntent, page, pageSize);
}

type RunOptions = { category: string; openNow: boolean; now: Date };

/** All ways to keep `size` items of a list, in the original order. */
function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];

  const [first, ...rest] = items;

  return [
    ...combinations(rest, size - 1).map((tail) => [first, ...tail]),
    ...combinations(rest, size),
  ];
}

function joinWords(words: string[]): string {
  return words.length <= 1
    ? (words[0] ?? "")
    : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/**
 * Runs the search. When nothing matches everything, it loosens the request one
 * step at a time (fewer features, a wider area, no time) and says what it
 * dropped, instead of leaving the person with an empty page.
 */
async function searchWithRelaxation(
  intent: SearchIntent,
  options: RunOptions,
): Promise<{ intent: SearchIntent; results: Place[] }> {
  const results = await runIntentSearch(intent, options);

  if (results.length > 0) return { intent, results };

  const relaxedIntent = (changed: SearchIntent, note: string): SearchIntent => ({
    ...changed,
    // the AI summary described the original request, which no longer applies
    summary: undefined,
    relaxed: note,
  });

  const features = intent.features ?? [];
  const where = intent.near ? ` near ${intent.near.label}` : "";

  // 1. Keep as many features as possible.
  for (let keep = features.length - 1; keep >= 0 && features.length > 0; keep--) {
    for (const subset of combinations(features, keep)) {
      const attempt = { ...intent, features: subset };
      const found = await runIntentSearch(attempt, options);

      if (found.length > 0) {
        const dropped = features.filter((feature) => !subset.includes(feature));

        return {
          intent: relaxedIntent(
            attempt,
            `No place${where} lists ${joinWords(features)} together, so I left out ${joinWords(dropped)}.`,
          ),
          results: found,
        };
      }
    }
  }

  // 2. Look further away.
  if (intent.near) {
    for (const factor of [2, 3]) {
      const near = { ...intent.near, radiusKm: intent.near.radiusKm * factor };
      const attempt = { ...intent, near };
      const found = await runIntentSearch(attempt, options);

      if (found.length > 0) {
        return {
          intent: relaxedIntent(
            attempt,
            `Nothing matched close to ${intent.near.label}, so I widened the search area.`,
          ),
          results: found,
        };
      }
    }
  }

  // 3. Forget the time.
  if (intent.openAt || intent.openNow) {
    const attempt = { ...intent, openAt: undefined, openNow: false };
    const found = await runIntentSearch(attempt, options);

    if (found.length > 0) {
      return {
        intent: relaxedIntent(
          attempt,
          "Nothing matched at that time, so I'm showing places regardless of opening hours.",
        ),
        results: found,
      };
    }
  }

  return { intent, results: [] };
}

/** One exact pass of the search for a given understanding of the request. */
async function runIntentSearch(
  intent: SearchIntent,
  { category, openNow, now }: RunOptions,
): Promise<Place[]> {
  // A category picked with the filter buttons wins over what the text said.
  const categories =
    category !== "All"
      ? [category]
      : (intent.categories ?? (intent.category ? [intent.category] : []));

  const terms = intent.terms ?? [];
  const cuisines = intent.cuisines ?? [];
  const features = intent.features ?? [];
  const near = intent.near;

  // A place matches when it has one of the cuisines OR a name that contains
  // one of the words. Features then narrow it down: all of them are required.
  const matchers = [
    ...(cuisines.length > 0
      ? [
          { tags: { hasSome: cuisines } },
          // places named after it but missing the tag ("Lunetta Pizza")
          ...cuisines.map((cuisine) => ({
            name: { contains: cuisine, mode: "insensitive" as const },
          })),
        ]
      : []),
    ...terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      ...(intent.matchAddress
        ? [{ address: { contains: term, mode: "insensitive" as const } }]
        : []),
    ]),
  ];

  const lngSpan = near
    ? near.radiusKm / (111 * Math.cos((near.lat * Math.PI) / 180))
    : 0;

  const where = {
    latitude: { not: null },
    longitude: { not: null },
    ...(categories.length > 0 ? { category: { in: categories } } : {}),
    ...(matchers.length > 0 ? { OR: matchers } : {}),
    ...(near || features.length > 0
      ? {
          AND: [
            ...(features.length > 0
              ? [{ tags: { hasEvery: features } }]
              : []),
            ...(near
              ? [
                  {
                    latitude: {
                      gte: near.lat - near.radiusKm / 111,
                      lte: near.lat + near.radiusKm / 111,
                    },
                  },
                  {
                    longitude: {
                      gte: near.lng - lngSpan,
                      lte: near.lng + lngSpan,
                    },
                  },
                ]
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

  let results = records.flatMap((record) => {
    const place = toPlace(record);
    return place ? [place] : [];
  });

  // The box above is a rough cut. Keep only places really inside the circle,
  // and show how far they are.
  if (near) {
    results = results
      .map((place) => ({
        place,
        km: haversineKm(near.lat, near.lng, place.latitude, place.longitude),
      }))
      .filter(({ km }) => km <= near.radiusKm)
      .sort((a, b) => a.km - b.km)
      .map(({ place, km }) => ({ ...place, distance: formatMiles(km) }));
  }

  if (intent.openAt) {
    const { day, minute } = intent.openAt;

    results = results.filter(
      (place) => isOpenAt(place.openingHours, day, minute) === true,
    );
  } else if (intent.openNow || openNow) {
    results = results.filter((place) => isOpenNow(place, now));
  }

  // Without a location, put the best matches first (more of the words or
  // cuisines, or the name starting with one), then complete listings.
  if (!near && (terms.length > 0 || cuisines.length > 0)) {
    const score = (place: Place) => {
      const name = place.name.toLowerCase();

      return (
        terms.filter((term) => name.includes(term)).length * 10 +
        cuisines.filter((cuisine) => place.tags.includes(cuisine)).length * 10 +
        (terms.some((term) => name.startsWith(term)) ? 3 : 0) +
        (place.openingHours ? 1 : 0)
      );
    };

    results = [...results].sort((a, b) => score(b) - score(a));
  }

  return results;
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
  // Best source: the cuisine tags, already sorted by how many places have them.
  const vocabulary = await getTagVocabulary();

  const fromTags = vocabulary.cuisines
    .map(formatTag)
    // words the search turns into a whole category (coffee) are skipped
    .filter((label) => !parseSearchIntent(label).category)
    .slice(0, limit);

  if (fromTags.length >= Math.min(limit, 4)) return fromTags;

  // No tags yet: count food words in the place names instead.
  const records = await prisma.place.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { name: true },
  });

  return pickPopularTerms(
    records.map((record) => record.name),
    { limit: limit + 4, minCount: 10 },
  )
    .map((term) => term.label)
    .filter((label) => !parseSearchIntent(label).category)
    .slice(0, limit);
}

export type MapDots = {
  /** Category names; the number in `data` is an index into this list */
  categories: string[];
  /**
   * Every place as 5 characters: x (2, base 36), y (2, base 36), category (1).
   * x and y run 0..1023 across the area, y from north to south.
   */
  data: string;
  /** Width divided by height of the area on the ground */
  aspect: number;
  total: number;
};

let dotsCache: { total: number; dots: MapDots } | null = null;

/**
 * All the places as tiny coloured dots, compact enough to send with the home
 * page. Drawn together they form the shape of the city.
 */
export async function getMapDots(): Promise<MapDots> {
  const total = await prisma.place.count({
    where: { latitude: { not: null }, longitude: { not: null } },
  });

  if (dotsCache && dotsCache.total === total) return dotsCache.dots;

  const rows = await prisma.place.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { latitude: true, longitude: true, category: true },
  });

  const points = rows.flatMap((row) =>
    row.latitude !== null && row.longitude !== null
      ? [{ lat: row.latitude, lng: row.longitude, category: row.category }]
      : [],
  );

  if (points.length === 0) {
    return { categories: [], data: "", aspect: 0.5, total: 0 };
  }

  // Ignore the few far-away places so they don't squash everything else.
  const trimmed = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const at = (fraction: number) =>
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];

    return { min: at(0.003), max: at(0.997) };
  };

  const lat = trimmed(points.map((point) => point.lat));
  const lng = trimmed(points.map((point) => point.lng));

  const categories = Array.from(new Set(points.map((point) => point.category)));
  const seen = new Set<number>();
  let data = "";

  const base36 = (value: number) => value.toString(36).padStart(2, "0");

  for (const point of points) {
    if (
      point.lat < lat.min ||
      point.lat > lat.max ||
      point.lng < lng.min ||
      point.lng > lng.max
    ) {
      continue;
    }

    const x = Math.round(((point.lng - lng.min) / (lng.max - lng.min)) * 1023);
    const y = Math.round(((lat.max - point.lat) / (lat.max - lat.min)) * 1023);
    const cell = x * 1024 + y;

    if (seen.has(cell)) continue;
    seen.add(cell);

    data += `${base36(x)}${base36(y)}${categories.indexOf(point.category) % 36}`;
  }

  // degrees to kilometres: longitude shrinks with latitude
  const midLat = ((lat.min + lat.max) / 2) * (Math.PI / 180);
  const aspect =
    ((lng.max - lng.min) * Math.cos(midLat)) / (lat.max - lat.min);

  const dots = { categories, data, aspect, total };

  dotsCache = { total, dots };

  return dots;
}

export type TagVocabulary = {
  /** Cuisine tags, most places first */
  cuisines: string[];
  /** Feature tags that exist in the data, most places first */
  features: string[];
};

// Tags that only repeat the category.
const GENERIC_TAGS = new Set([
  "cafe",
  "restaurant",
  "fast food",
  "fast_food",
  "park",
  "museum",
  "gallery",
  "attraction",
]);

const MIN_PLACES_PER_TAG = 8;

let tagCache: { key: string; vocabulary: TagVocabulary } | null = null;

/**
 * The cuisines and features that really exist in the tags column. The cache
 * is renewed whenever places or tagged places change in number, so running
 * the tag import is picked up without a restart.
 */
export async function getTagVocabulary(): Promise<TagVocabulary> {
  const [total, tagged] = await Promise.all([
    prisma.place.count({
      where: { latitude: { not: null }, longitude: { not: null } },
    }),
    prisma.place.count({ where: { tags: { isEmpty: false } } }),
  ]);

  const key = `${total}:${tagged}`;

  if (tagCache && tagCache.key === key) return tagCache.vocabulary;

  const rows =
    tagged > 0
      ? await prisma.place.findMany({
          where: { tags: { isEmpty: false } },
          select: { tags: true },
        })
      : [];

  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const tag of row.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const ranked = [...counts]
    .filter(([tag, count]) => count >= MIN_PLACES_PER_TAG && !GENERIC_TAGS.has(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const vocabulary: TagVocabulary = {
    cuisines: ranked
      // "coffee" and similar words are categories, not cuisines
      .filter(([tag]) => !isFeatureTag(tag) && !parseSearchIntent(tag).category)
      .slice(0, 80)
      .map(([tag]) => tag),
    features: ranked
      .filter(([tag]) => FEATURE_TAGS.some((feature) => feature === tag))
      .map(([tag]) => tag),
  };

  tagCache = { key, vocabulary };

  return vocabulary;
}

// The neighborhood list never changes while the server runs, but the data
// can, so the counts are recomputed only when the number of places changes.
let coverageCache: { total: number; areas: Area[] } | null = null;

const MIN_PLACES_PER_AREA = 25;

/**
 * Neighborhoods that really have places in the database, most places first.
 * This is what the AI is allowed to use, so it never sends anyone to an empty
 * part of the map.
 */
export async function getCoveredAreas(): Promise<Area[]> {
  const total = await prisma.place.count({
    where: { latitude: { not: null }, longitude: { not: null } },
  });

  if (coverageCache && coverageCache.total === total) {
    return coverageCache.areas;
  }

  const points = await prisma.place.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { latitude: true, longitude: true },
  });

  const areas = AREAS.map((area) => ({
    area,
    count: points.filter(
      (point) =>
        point.latitude !== null &&
        point.longitude !== null &&
        haversineKm(area.lat, area.lng, point.latitude, point.longitude) <=
          area.radiusKm,
    ).length,
  }))
    .filter(({ count }) => count >= MIN_PLACES_PER_AREA)
    .sort((a, b) => b.count - a.count)
    .map(({ area }) => area);

  coverageCache = { total, areas };

  return areas;
}

/**
 * Example searches written the way a person would say them, built from the
 * data: real food words and neighborhoods that have many places.
 */
export async function getSearchSuggestions(count = 4): Promise<string[]> {
  const [terms, areas, categories, vocabulary] = await Promise.all([
    getPopularSearchTerms(6),
    getCoveredAreas(),
    getCategoryCounts(),
    getTagVocabulary(),
  ]);

  const food = terms.map((term) => term.toLowerCase());
  const area = (index: number) => areas[index]?.key;
  const hasFeature = (feature: string) => vocabulary.features.includes(feature);

  const label = (name?: string) => {
    const category =
      categories.find((item) => item.name === name) ?? categories[0];

    return category ? getCategoryLabel(category.name).toLowerCase() : undefined;
  };

  const suggestions = [
    food[0] && area(1) ? `${food[0]} near ${area(1)}` : undefined,
    hasFeature("wifi") && label("Cafe")
      ? `${label("Cafe")} with wifi, open now`
      : undefined,
    food[1] && hasFeature("outdoor seating")
      ? `${food[1]} with outdoor seating`
      : food[1]
        ? `${food[1]} that's open late`
        : undefined,
    hasFeature("vegan") && food[2] ? `vegan ${food[2]}` : undefined,
    food[3] && area(2) ? `${food[3]} in ${area(2)}` : undefined,
    label() && area(0) ? `${label()} open now near ${area(0)}` : undefined,
  ];

  return suggestions
    .filter((item): item is string => Boolean(item))
    .slice(0, count);
}
