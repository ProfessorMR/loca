import { AREAS, findAreaInText } from "@/lib/nyc-areas";
import { formatTime, localTime } from "@/lib/opening-hours";
import type {
  SearchContext,
  SearchIntentExtractor,
} from "@/lib/search-intent-extractor";
import type { SearchIntent } from "@/types/search";

import {
  categoryKeywords,
  categoryPhrases,
  intentPhrases,
  priceKeywords,
  tagKeywords,
} from "@/lib/search-vocabulary";

// Words that say nothing about WHICH place the person wants.
const FILLER_WORDS = new Set([
  "the", "and", "for", "with", "near", "nearby", "around", "close", "open",
  "now", "right", "that", "this", "place", "places", "spot", "spots", "good",
  "best", "nice", "great", "some", "where", "find", "want", "looking", "can",
  "get", "please", "show", "give", "any", "late", "has", "have", "are", "from",
  "you", "your", "need", "like", "that's", "thats", "it's", "its", "whats", "what's", "somewhere", "something", "anywhere", "in", "at", "to",
]);

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? [];
}

// Every word the vocabulary already gives a meaning to (category, mood, price).
const vocabularyWords = new Set(
  [
    ...Object.keys(categoryKeywords),
    ...Object.keys(tagKeywords),
    ...Object.keys(priceKeywords),
    ...intentPhrases.flatMap(({ phrases }) => phrases),
    ...Object.values(categoryPhrases).flat(),
  ].flatMap(tokenize),
);

const categoryPhraseSet = new Set(Object.values(categoryPhrases).flat());

// How people write each feature tag. Only features that exist in the data are used.
const FEATURE_PATTERNS: Record<string, RegExp> = {
  "outdoor seating": /\b(outdoor|outside|patio|terrace|garden|sidewalk)( seating| dining)?\b/i,
  wifi: /\bwi-?fi\b|\binternet\b|\bwlan\b/i,
  "wheelchair accessible": /\bwheelchair( accessible)?\b|\baccessible\b/i,
  delivery: /\bdeliver(y|s)?\b/i,
  takeaway: /\btake-?out\b|\btake-?away\b|\bto go\b/i,
  reservations: /\breservations?\b|\bbook a table\b/i,
  "drive-through": /\bdrive[- ]?(thru|through)\b/i,
  vegetarian: /\bvegetarian\b/i,
  vegan: /\bvegan\b/i,
  halal: /\bhalal\b/i,
  kosher: /\bkosher\b/i,
  "gluten free": /\bgluten[- ]?free\b/i,
  beer: /\bbeers?\b/i,
  wine: /\bwine\b/i,
  cocktails: /\bcocktails?\b/i,
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const OPEN_LATE = /\bopen late\b|\blate night\b|\blate-night\b|\bafter midnight\b/i;

const OPEN_NOW = /\bopen (right )?now\b|\bopen today\b|الان باز|همین الان باز|الان بازه/i;

export function parseSearchIntent(
  query: string,
  context?: SearchContext,
): SearchIntent {
  const normalizedQuery = query.trim().toLowerCase();

  const explicitCategory = Object.entries(categoryKeywords).find(([keyword]) =>
    normalizedQuery.includes(keyword),
  )?.[1];

  const inferredCategory = Object.entries(categoryPhrases).find(([, phrases]) =>
    phrases.some((phrase) => normalizedQuery.includes(phrase)),
  )?.[0];

  const category = explicitCategory ?? inferredCategory;

  const tags = Object.entries(tagKeywords)
    .filter(([keyword]) => normalizedQuery.includes(keyword))
    .map(([, tag]) => tag);

  const phraseTags = intentPhrases
    .filter(({ phrases }) =>
      phrases.some((phrase) => normalizedQuery.includes(phrase)),
    )
    .map(({ tag }) => tag);

  const priceLevel = Object.entries(priceKeywords).find(([keyword]) =>
    normalizedQuery.includes(keyword),
  )?.[1];

  const area = findAreaInText(query, context?.areas ?? AREAS);

  // Features the person asked for, if the data has them.
  let remaining = query;
  const features: string[] = [];

  for (const [feature, pattern] of Object.entries(FEATURE_PATTERNS)) {
    if (!pattern.test(remaining)) continue;
    if (context && !context.features.includes(feature)) continue;

    features.push(feature);
    remaining = remaining.replace(new RegExp(pattern.source, "gi"), " ");
  }

  // Cuisines from the data ("pizza", "thai"). Words that already mean a
  // category (like "coffee") stay categories.
  const cuisines: string[] = [];

  for (const cuisine of context?.cuisines ?? []) {
    const pattern = new RegExp(`\\b${escapeRegExp(cuisine)}s?\\b`, "i");

    if (
      pattern.test(remaining) &&
      !tokenize(cuisine).some((word) => vocabularyWords.has(word))
    ) {
      cuisines.push(cuisine);
      remaining = remaining.replace(new RegExp(pattern.source, "gi"), " ");
    }
  }

  // What is left after removing words that already mean something is treated
  // as part of a name or street ("pizza", "broadway").
  const areaWords = new Set(
    area ? [area.key, ...(area.aliases ?? [])].flatMap(tokenize) : [],
  );

  const terms = Array.from(
    new Set(
      tokenize(remaining).filter(
        (word) =>
          word.length >= 3 &&
          !FILLER_WORDS.has(word) &&
          !vocabularyWords.has(word) &&
          !areaWords.has(word),
      ),
    ),
  ).slice(0, 4);

  // Moods and prices are recognised but the data cannot answer them.
  const unsupported = Array.from(
    new Set(
      [...Object.keys(tagKeywords), ...Object.keys(priceKeywords)].filter(
        (keyword) =>
          normalizedQuery.includes(keyword) &&
          !categoryPhraseSet.has(keyword) &&
          !features.some((feature) => FEATURE_PATTERNS[feature].test(keyword)),
      ),
    ),
  ).slice(0, 4);

  // "open late" means open at 11 PM tonight
  const openLate = OPEN_LATE.test(query);

  return {
    query: query.trim(),
    category,
    categories: category ? [category] : [],
    tags: Array.from(new Set([...tags, ...phraseTags])),
    priceLevel,
    sort: area ? "distance" : "recommended",
    cuisines: cuisines.slice(0, 3),
    features: features.slice(0, 4),
    terms,
    matchAddress: true,
    openNow: !openLate && OPEN_NOW.test(query),
    openAt: openLate
      ? { day: localTime(new Date()).day, minute: 23 * 60, label: formatTime(23 * 60) }
      : undefined,
    near: area
      ? {
          label: area.key,
          lat: area.lat,
          lng: area.lng,
          radiusKm: area.radiusKm,
        }
      : undefined,
    unsupported,
    source: "rules",
  };
}

export const ruleBasedIntentExtractor: SearchIntentExtractor = {
  extract(query, context) {
    return parseSearchIntent(query, context);
  },
};
