// One color per category, used by the place bullets, the map markers and the
// dot map, so a category looks the same everywhere. These match the
// --restaurant, --fastfood and --cafe variables in globals.css.
export const CATEGORY_COLORS: Record<string, string> = {
  Restaurant: "#c2412d",
  "Fast Food": "#a86400",
  Cafe: "#0b7a6f",
};

const FALLBACK_COLOR = "#3b4a6b";

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}

// Kept for the empty-photo tiles, which build their color from a hue.
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
