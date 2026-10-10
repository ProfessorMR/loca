import type { SearchIntent } from "@/types/search";

export type SearchIntentExtractor = {
  extract(query: string): SearchIntent | Promise<SearchIntent>;
};
