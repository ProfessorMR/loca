// One color per category, used by the empty-photo cards and the map markers
// so a category looks the same everywhere. Unknown categories get a neutral blue.
export const CATEGORY_HUES: Record<string, number> = {
  Restaurant: 8,
  "Fast Food": 36,
  Cafe: 168,
  Bar: 275,
  Hotel: 214,
  Park: 140,
};

const FALLBACK_HUE = 220;

export function getCategoryHue(category: string): number {
  return CATEGORY_HUES[category] ?? FALLBACK_HUE;
}
