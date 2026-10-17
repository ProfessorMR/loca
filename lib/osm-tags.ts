/**
 * Turns the raw OpenStreetMap tags of a place into the short, readable tags
 * stored in Place.tags ("pizza", "outdoor seating", "wifi"...).
 *
 * Two kinds of tag end up in the same list:
 *  - cuisine tags: whatever the map says the place serves (pizza, thai...)
 *  - feature tags: a fixed set of facts (see FEATURE_TAGS)
 *
 * A tag only exists when the map says so. A missing tag does NOT mean the
 * place lacks that feature, only that nobody wrote it down.
 */

export const FEATURE_TAGS = [
  "outdoor seating",
  "wifi",
  "wheelchair accessible",
  "delivery",
  "takeaway",
  "reservations",
  "drive-through",
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "gluten free",
  "beer",
  "wine",
  "cocktails",
] as const;

export type FeatureTag = (typeof FEATURE_TAGS)[number];

const featureSet = new Set<string>(FEATURE_TAGS);

export function isFeatureTag(tag: string): boolean {
  return featureSet.has(tag);
}

const SPECIAL_LABELS: Record<string, string> = {
  wifi: "WiFi",
  bbq: "BBQ",
  "tex-mex": "Tex-Mex",
};

/** "outdoor seating" -> "Outdoor seating", "wifi" -> "WiFi" */
export function formatTag(tag: string): string {
  return SPECIAL_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}

type OsmProps = Record<string, unknown>;

function text(props: OsmProps, key: string): string {
  const value = props[key];

  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// OSM values that really mean "yes" for a feature.
const isYes = (value: string, extra: string[] = []) =>
  ["yes", "only", ...extra].includes(value);

const CUISINE_ALIASES: Record<string, string> = {
  coffee_shop: "coffee",
  tacos: "taco",
  noodles: "noodle",
  barbecue: "bbq",
  steak_house: "steak house",
  fried_chicken: "fried chicken",
};

function cuisineTags(props: OsmProps): string[] {
  const raw = text(props, "cuisine");
  if (!raw) return [];

  const tags = raw
    .split(";")
    .map((value) => value.trim())
    .filter((value) => value.length >= 2 && value.length <= 30)
    .map((value) => CUISINE_ALIASES[value] ?? value.replace(/_/g, " "));

  return Array.from(new Set(tags)).slice(0, 5);
}

function featureTags(props: OsmProps): FeatureTag[] {
  const features: FeatureTag[] = [];
  const add = (condition: boolean, tag: FeatureTag) => {
    if (condition) features.push(tag);
  };

  const outdoor = text(props, "outdoor_seating");
  add(outdoor !== "" && outdoor !== "no", "outdoor seating");

  const internet = text(props, "internet_access");
  add(["wlan", "yes", "yes, wifi", "wifi"].includes(internet), "wifi");

  add(
    ["yes", "designated"].includes(text(props, "wheelchair")),
    "wheelchair accessible",
  );
  add(isYes(text(props, "delivery"), ["partner"]), "delivery");
  add(isYes(text(props, "takeaway")), "takeaway");
  add(
    isYes(text(props, "reservation"), ["recommended", "required"]),
    "reservations",
  );
  add(text(props, "drive_through") === "yes", "drive-through");

  add(isYes(text(props, "diet:vegetarian")), "vegetarian");
  add(isYes(text(props, "diet:vegan")), "vegan");
  add(isYes(text(props, "diet:halal")), "halal");
  add(isYes(text(props, "diet:kosher")), "kosher");
  add(isYes(text(props, "diet:gluten_free")), "gluten free");

  const beer = text(props, "drink:beer");
  add(beer !== "" && beer !== "no", "beer");
  add(isYes(text(props, "drink:wine"), ["served"]), "wine");
  add(isYes(text(props, "cocktails"), ["served"]), "cocktails");

  return features;
}

/** Cuisine tags first (most useful on a card), then features. */
export function buildPlaceTags(props: OsmProps): string[] {
  return Array.from(new Set([...cuisineTags(props), ...featureTags(props)]));
}
