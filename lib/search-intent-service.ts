import { ruleBasedIntentExtractor } from "@/lib/search-intent";
import type { SearchIntent } from "@/types/search";

export async function extractSearchIntent(
  query: string,
): Promise<SearchIntent> {
  return ruleBasedIntentExtractor.extract(query);
}
