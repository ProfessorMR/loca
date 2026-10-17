/**
 * Neighborhoods and landmarks used to understand "near X" searches.
 *
 * This is only a list of known places. Which ones are offered to the search is
 * decided by the data: an area with (almost) no places inside it is dropped
 * (see getCoveredAreas in lib/places.ts), so nobody is sent to an empty map.
 */
export type Area = {
  key: string;
  lat: number;
  lng: number;
  /** How far "near" reaches, in km */
  radiusKm: number;
  /** Other ways people write it */
  aliases?: string[];
};

export const AREAS: Area[] = [
  { key: "Times Square", lat: 40.758, lng: -73.9855, radiusKm: 0.7, aliases: ["Theater District"] },
  { key: "Midtown", lat: 40.7549, lng: -73.984, radiusKm: 1.3, aliases: ["Midtown Manhattan"] },
  { key: "Midtown East", lat: 40.7549, lng: -73.9707, radiusKm: 0.9 },
  { key: "Grand Central", lat: 40.7527, lng: -73.9772, radiusKm: 0.7, aliases: ["Grand Central Terminal"] },
  { key: "Penn Station", lat: 40.7506, lng: -73.9935, radiusKm: 0.7, aliases: ["Herald Square", "Madison Square Garden"] },
  { key: "Hell's Kitchen", lat: 40.7638, lng: -73.9918, radiusKm: 0.9, aliases: ["Hells Kitchen"] },
  { key: "Columbus Circle", lat: 40.7681, lng: -73.9819, radiusKm: 0.7, aliases: ["Lincoln Center"] },
  { key: "Murray Hill", lat: 40.7479, lng: -73.9757, radiusKm: 0.8 },
  { key: "Kips Bay", lat: 40.7423, lng: -73.9801, radiusKm: 0.7 },
  { key: "Gramercy", lat: 40.7368, lng: -73.9845, radiusKm: 0.7 },
  { key: "Flatiron", lat: 40.7411, lng: -73.9897, radiusKm: 0.6, aliases: ["Flatiron District"] },
  { key: "Union Square", lat: 40.7359, lng: -73.9911, radiusKm: 0.7 },
  { key: "Chelsea", lat: 40.7465, lng: -74.0014, radiusKm: 0.9 },
  { key: "Meatpacking District", lat: 40.741, lng: -74.0078, radiusKm: 0.5 },
  { key: "Greenwich Village", lat: 40.7336, lng: -74.0027, radiusKm: 0.8, aliases: ["West Village", "The Village"] },
  { key: "Washington Square Park", lat: 40.7308, lng: -73.9973, radiusKm: 0.6, aliases: ["NYU", "Washington Square"] },
  { key: "NoHo", lat: 40.7268, lng: -73.9926, radiusKm: 0.5 },
  { key: "East Village", lat: 40.7265, lng: -73.9815, radiusKm: 0.8 },
  { key: "SoHo", lat: 40.7233, lng: -74.003, radiusKm: 0.7 },
  { key: "Lower East Side", lat: 40.715, lng: -73.9843, radiusKm: 0.8, aliases: ["LES"] },
  { key: "Little Italy", lat: 40.7191, lng: -73.9973, radiusKm: 0.4 },
  { key: "Chinatown", lat: 40.7158, lng: -73.997, radiusKm: 0.6 },
  { key: "Tribeca", lat: 40.7163, lng: -74.0086, radiusKm: 0.8 },
  { key: "Financial District", lat: 40.7075, lng: -74.0113, radiusKm: 0.9, aliases: ["FiDi", "Wall Street"] },
  { key: "Battery Park City", lat: 40.7117, lng: -74.0158, radiusKm: 0.8, aliases: ["Battery Park"] },
  { key: "Central Park", lat: 40.7829, lng: -73.9654, radiusKm: 1.2 },
  { key: "Upper West Side", lat: 40.787, lng: -73.9754, radiusKm: 1.6, aliases: ["UWS"] },
  { key: "Upper East Side", lat: 40.7736, lng: -73.9566, radiusKm: 1.8, aliases: ["UES"] },
  { key: "Columbia University", lat: 40.8075, lng: -73.9626, radiusKm: 0.9, aliases: ["Morningside Heights", "Columbia"] },
  { key: "Harlem", lat: 40.8116, lng: -73.9465, radiusKm: 1.8 },
  { key: "Washington Heights", lat: 40.8417, lng: -73.9393, radiusKm: 1.6 },
  { key: "Inwood", lat: 40.8677, lng: -73.9212, radiusKm: 1.4 },
  { key: "DUMBO", lat: 40.7033, lng: -73.989, radiusKm: 0.7 },
  { key: "Williamsburg", lat: 40.7081, lng: -73.9571, radiusKm: 1.4 },
  { key: "Greenpoint", lat: 40.7304, lng: -73.9515, radiusKm: 1.2 },
  { key: "Bushwick", lat: 40.6944, lng: -73.9213, radiusKm: 1.6 },
  { key: "Astoria", lat: 40.7644, lng: -73.9235, radiusKm: 1.8 },
  { key: "Long Island City", lat: 40.7447, lng: -73.9485, radiusKm: 1.5, aliases: ["LIC"] },
  { key: "Fort Lee", lat: 40.8509, lng: -73.9701, radiusKm: 1.5 },
];

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** "0.4 mi" (these places are in the US) */
export function formatMiles(km: number): string {
  const miles = km * 0.621371;

  return miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[’']/g, "");
}

/** Finds an area written in free text. The longest name wins. */
export function findAreaInText(
  text: string,
  areas: Area[] = AREAS,
): Area | undefined {
  const haystack = normalizeName(text);
  let best: { area: Area; length: number } | undefined;

  for (const area of areas) {
    for (const name of [area.key, ...(area.aliases ?? [])]) {
      const needle = normalizeName(name);
      const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}($|[^a-z0-9])`);

      if (pattern.test(haystack) && (!best || needle.length > best.length)) {
        best = { area, length: needle.length };
      }
    }
  }

  return best?.area;
}

/** Looks an area up by the name the AI returned. */
export function findAreaByKey(key: string, areas: Area[]): Area | undefined {
  const wanted = normalizeName(key).trim();

  return areas.find(
    (area) =>
      normalizeName(area.key) === wanted ||
      area.aliases?.some((alias) => normalizeName(alias) === wanted),
  );
}
