import { aiIntentExtractor } from "@/lib/ai-intent-extractor";
import { ruleBasedIntentExtractor } from "@/lib/search-intent";
import type { SearchIntent } from "@/types/search";
import type { SearchIntentExtractor } from "@/lib/search-intent-extractor";

const defaultExtractor: SearchIntentExtractor = aiIntentExtractor;

export async function extractSearchIntent(
  query: string,
  extractor: SearchIntentExtractor = defaultExtractor,
): Promise<SearchIntent> {
  try {
    return await extractor.extract(query);
  } catch (error) {
    console.error("AI intent extraction failed:", error);

    return await ruleBasedIntentExtractor.extract(query);
  }
}
