import type { SearchIntent } from "@/types/search";

const categoryKeywords: Record<string, string> = {
  restaurant: "Restaurant",
  restaurants: "Restaurant",
  cafe: "Cafe",
  cafes: "Cafe",
  coffee: "Cafe",
  bar: "Bar",
  bars: "Bar",
  hotel: "Hotel",
  hotels: "Hotel",
  park: "Park",
  parks: "Park",
};

const tagKeywords: Record<string, string> = {
  quiet: "quiet",
  calm: "quiet",
  peaceful: "quiet",
  work: "work-friendly",
  working: "work-friendly",
  workspace: "work-friendly",
  coworking: "work-friendly",
  date: "date",
  romantic: "date",
  dinner: "dinner",
  cozy: "cozy",
  comfortable: "cozy",
  casual: "casual",
  nature: "nature",
  relaxing: "relaxing",
  outdoor: "outdoor",
};
const priceKeywords: Record<string, string> = {
  free: "Free",
  cheap: "$",
  affordable: "$",
  budget: "$",
  inexpensive: "$",
  expensive: "$$$",
  pricey: "$$$",
};
export function parseSearchIntent(query: string): SearchIntent {
  const normalizedQuery = query.trim().toLowerCase();

  const category = Object.entries(categoryKeywords).find(([keyword]) =>
    normalizedQuery.includes(keyword),
  )?.[1];

  const tags = Object.entries(tagKeywords)
    .filter(([keyword]) => normalizedQuery.includes(keyword))
    .map(([, tag]) => tag);

  const priceLevel = Object.entries(priceKeywords).find(([keyword]) =>
    normalizedQuery.includes(keyword),
  )?.[1];

  return {
    query: query.trim(),
    category,
    tags: Array.from(new Set(tags)),
    priceLevel,
    sort: "recommended",
  };
}
