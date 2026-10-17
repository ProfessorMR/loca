export type SearchNear = {
  /** Name shown to the user, e.g. "Union Square" */
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

export type SearchOpenAt = {
  /** 0 = Monday ... 6 = Sunday */
  day: number;
  /** Minutes after midnight */
  minute: number;
  /** Shown to the user, e.g. "11 PM" or "Sat 2 AM" */
  label: string;
};

export type SearchIntent = {
  query: string;
  category?: string;
  tags: string[];
  priceLevel?: string;
  sort: "recommended" | "rating" | "distance";

  // What the search understood. Filled by the AI or the rule-based extractor.
  categories?: string[];
  /** Cuisines from the place tags ("pizza", "thai"). Any of them matches. */
  cuisines?: string[];
  /** Facts from the place tags ("wifi", "outdoor seating"). All must match. */
  features?: string[];
  /** Words that should appear in the place name (any of them) */
  terms?: string[];
  /** Also look for the terms in the address (used by the rule-based fallback) */
  matchAddress?: boolean;
  openNow?: boolean;
  openAt?: SearchOpenAt;
  near?: SearchNear;
  /** Things the user asked for that the data cannot answer (quiet, cheap...) */
  unsupported?: string[];
  summary?: string;
  /** Set when nothing matched everything and some conditions were dropped */
  relaxed?: string;
  /** A short message for the person, e.g. the AI was skipped */
  notice?: string;
  source?: "ai" | "rules";
};
