export const FAVORITES_KEY = "loca:favorites";

const MAX_FAVORITES = 500;

/** Reads the saved list from whatever was stored, ignoring anything odd. */
export function parseFavorites(raw: string | null | undefined): string[] {
  if (!raw) return [];

  try {
    const value: unknown = JSON.parse(raw);

    if (!Array.isArray(value)) return [];

    return Array.from(
      new Set(
        value.filter(
          (item): item is string =>
            typeof item === "string" && item.length > 0 && item.length <= 100,
        ),
      ),
    ).slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

/** Adds the id at the end (newest last), or removes it if it is already there. */
export function toggleFavoriteId(ids: string[], id: string): string[] {
  return ids.includes(id)
    ? ids.filter((item) => item !== id)
    : [...ids, id].slice(-MAX_FAVORITES);
}
