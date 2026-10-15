/**
 * Food words worth offering as quick searches. Which ones are actually shown,
 * and in what order, is decided by how many places in YOUR data contain them
 * (see pickPopularTerms), so the list follows the data instead of being typed
 * by hand.
 *
 * Only words that are unlikely to appear inside unrelated names are listed
 * ("deli" or "pho" would match "Delight" and "Photo").
 */
export const FOOD_TERMS = [
  "pizza",
  "sushi",
  "bagel",
  "burger",
  "ramen",
  "thai",
  "taco",
  "chinese",
  "italian",
  "mexican",
  "indian",
  "korean",
  "japanese",
  "greek",
  "vietnamese",
  "bakery",
  "steak",
  "seafood",
  "chicken",
  "vegan",
  "noodle",
  "dumpling",
  "donut",
  "juice",
  "wings",
  "sandwich",
  "curry",
  "falafel",
  "halal",
  "kebab",
  "crepe",
  "brunch",
  "pasta",
  "gelato",
  "bbq",
  "salad",
];

export type PopularTerm = {
  /** Text to search for, e.g. "Pizza" */
  label: string;
  /** How many place names contain it */
  count: number;
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Counts how many names contain each food word (the same substring match the
 * search uses, so the count equals the number of results) and returns the most
 * common ones.
 */
export function pickPopularTerms(
  names: string[],
  options: {
    limit: number;
    /** Ignore words that match fewer places than this */
    minCount?: number;
    /** Words that should not be offered (e.g. ones that map to a category) */
    exclude?: (term: string) => boolean;
  },
): PopularTerm[] {
  const { limit, minCount = 10, exclude } = options;
  const lowerNames = names.map((name) => name.toLowerCase());

  return FOOD_TERMS.filter((term) => !exclude?.(term))
    .map((term) => ({
      label: capitalize(term),
      count: lowerNames.filter((name) => name.includes(term)).length,
    }))
    .filter((term) => term.count >= minCount)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}
