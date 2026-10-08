import { ruleBasedIntentExtractor } from "@/lib/search-intent";
import type { SearchIntentExtractor } from "@/lib/search-intent-extractor";

const defaultExtractor: SearchIntentExtractor = ruleBasedIntentExtractor;

export function extractSearchIntent(
  query: string,
  extractor: SearchIntentExtractor = defaultExtractor,
) {
  return extractor.extract(query);
}
