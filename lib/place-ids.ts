export const MAX_PLACE_IDS = 100;

const ID_PATTERN = /^[A-Za-z0-9_.:-]{1,100}$/;

/** Checks the `ids` query value of the places API: "a,b,c". */
export function parseIdList(
  raw: string | null,
): { ids: string[] } | { error: string } {
  if (!raw || raw.trim() === "") {
    return { error: "ids is required" };
  }

  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (ids.length === 0) return { error: "ids is required" };

  if (ids.length > MAX_PLACE_IDS) {
    return { error: `At most ${MAX_PLACE_IDS} ids at a time` };
  }

  if (!ids.every((id) => ID_PATTERN.test(id))) {
    return { error: "ids contains an invalid id" };
  }

  return { ids };
}
