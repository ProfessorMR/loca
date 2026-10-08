import type { SearchIntent } from "@/types/search";
import type { SearchIntentExtractor } from "@/lib/search-intent-extractor";

import {
  categoryKeywords,
  categoryPhrases,
  intentPhrases,
  priceKeywords,
  tagKeywords,
} from "@/lib/search-vocabulary";

export function parseSearchIntent(query: string): SearchIntent {
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

  return {
    query: query.trim(),
    category,
    tags: Array.from(new Set([...tags, ...phraseTags])),
    priceLevel,
    sort: "recommended",
  };
}

export const ruleBasedIntentExtractor: SearchIntentExtractor = {
  extract(query) {
    return parseSearchIntent(query);
  },
};
