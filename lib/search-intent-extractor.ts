import type { Area } from "@/lib/nyc-areas";
import type { SearchIntent } from "@/types/search";

/** What the data can actually answer, so the extractor never promises more. */
export type SearchContext = {
  /** Categories that exist in the database */
  categories: string[];
  /** Neighborhoods that have places in the database */
  areas: Area[];
  /** Cuisine tags that exist in the database ("pizza", "thai"...) */
  cuisines: string[];
  /** Feature tags that exist in the database ("wifi", "outdoor seating"...) */
  features: string[];
};

export type ExtractHooks = {
  /** Called right before a paid model call. Throw to cancel it. */
  beforeModelCall?: () => void;
};

export type SearchIntentExtractor = {
  extract(
    query: string,
    context?: SearchContext,
    hooks?: ExtractHooks,
  ): SearchIntent | Promise<SearchIntent>;
};
