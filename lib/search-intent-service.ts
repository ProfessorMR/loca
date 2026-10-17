import { aiIntentExtractor, isAiConfigured } from "@/lib/ai-intent-extractor";
import { AiLimitError, allowAiCall } from "@/lib/rate-limit";
import { ruleBasedIntentExtractor } from "@/lib/search-intent";
import type { SearchContext } from "@/lib/search-intent-extractor";
import type { SearchIntent } from "@/types/search";

/**
 * Understands a search request. The AI is used when it is configured; if it is
 * missing, slow, over its limit or answers badly, the simple rule-based
 * extractor takes over so search never breaks.
 */
export async function extractSearchIntent(
  query: string,
  context: SearchContext,
  options: { clientKey?: string } = {},
): Promise<SearchIntent> {
  if (isAiConfigured()) {
    try {
      return await aiIntentExtractor.extract(query, context, {
        beforeModelCall: () => {
          if (!allowAiCall(options.clientKey)) throw new AiLimitError();
        },
      });
    } catch (error) {
      if (error instanceof AiLimitError) {
        const intent = await ruleBasedIntentExtractor.extract(query, context);

        return {
          ...intent,
          notice:
            "Smart search is taking a short break, so these are basic results.",
        };
      }

      console.warn(
        "AI search is unavailable, using the rule-based fallback:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return ruleBasedIntentExtractor.extract(query, context);
}
