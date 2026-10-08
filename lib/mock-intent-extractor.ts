import type { SearchIntent } from "@/types/search";
import type { SearchIntentExtractor } from "@/lib/search-intent-extractor";

export const mockIntentExtractor: SearchIntentExtractor = {
  extract(query): SearchIntent {
    return {
      query: query.trim(),
      category: "Cafe",
      tags: ["quiet", "cozy", "work-friendly"],
      priceLevel: "$$",
      sort: "recommended",
    };
  },
};
