import OpenAI from "openai";

import { findAreaByKey } from "@/lib/nyc-areas";
import { FEATURE_TAGS } from "@/lib/osm-tags";
import { parseSearchIntent } from "@/lib/search-intent";
import type { Area } from "@/lib/nyc-areas";
import { DAY_NAMES, formatTime, localTime } from "@/lib/opening-hours";
import type {
  SearchContext,
  SearchIntentExtractor,
} from "@/lib/search-intent-extractor";
import type { SearchIntent, SearchNear, SearchOpenAt } from "@/types/search";

/**
 * Turns a free-form request ("a late-night pizza place near Union Square")
 * into filters the database can really answer.
 *
 * The model only ever sees what the data supports (categories, neighborhoods
 * that have places) and everything it returns is validated here, so a wrong or
 * hostile answer can never produce an unexpected query.
 */

// Words that match nearly every place, so they are useless as name filters.
const GENERIC_TERMS = new Set([
  "restaurant",
  "restaurants",
  "cafe",
  "cafes",
  "coffee shop",
  "place",
  "places",
  "spot",
  "spots",
  "food",
  "eat",
  "good",
  "best",
  "great",
  "nice",
  "cheap",
  "open",
  "near",
  "late",
  "now",
  "the",
  "and",
]);

const DAY_ALIASES: Record<string, number> = {
  mon: 0,
  monday: 0,
  tue: 1,
  tues: 1,
  tuesday: 1,
  wed: 2,
  wednesday: 2,
  thu: 3,
  thur: 3,
  thurs: 3,
  thursday: 3,
  fri: 4,
  friday: 4,
  sat: 5,
  saturday: 5,
  sun: 6,
  sunday: 6,
};

export function buildSystemPrompt(context: SearchContext): string {
  const categories = context.categories.join(", ") || "none";
  const areas = context.areas.map((area) => area.key).join(", ") || "none";
  const cuisines = context.cuisines.slice(0, 60).join(", ") || "none";
  const features = context.features.join(", ") || "none";

  // Only say "no data" about things the data really lacks.
  const noData = [
    "ambiance (quiet, cozy, romantic, lively)",
    "price",
    "ratings and reviews",
    "kid or pet friendliness",
    ...FEATURE_TAGS.filter((tag) => !context.features.includes(tag)),
  ].join(", ");

  return `You turn a person's request into search filters for LOCA, a place-discovery app.

The person may write in any language, including Persian (Farsi). Understand informal wording.

WHAT THE DATA KNOWS (be strict about this)
- Every place has: a name, a category, an address, opening hours (for about half of them), a map position, and often tags.
- Categories that exist: ${categories}.
- The places are in Manhattan and right next to it. Neighborhoods that have places: ${areas}.
- Cuisine tags that exist: ${cuisines}.
- Feature tags that exist: ${features}.
- Tags come from a volunteer map. A place without a tag may still have that feature, so never say a place does not have something.
- There is NO data on: ${noData}.
- Besides tags, a place can be found by the words in its NAME.

Return ONLY one JSON object, no markdown, in this shape:
{
  "categories": [],
  "cuisines": [],
  "features": [],
  "terms": [],
  "openNow": false,
  "openAt": null,
  "near": null,
  "unsupported": [],
  "summary": ""
}

FIELDS
- categories: zero or more of the categories above, only when the request clearly says it (coffee or cafe -> Cafe; fast food or a quick bite -> Fast Food; restaurant, dinner, lunch -> Restaurant). Coffee is the Cafe category, never a cuisine.
- cuisines: up to 3 values copied EXACTLY from the cuisine list, translated from any language (ایتالیایی -> italian). Skip if none fits.
- features: up to 4 values copied EXACTLY from the feature list (patio, outside, fresh air -> outdoor seating; laptop or internet -> wifi; takeout -> takeaway; wheelchair -> wheelchair accessible). Skip if none fits.
- terms: up to 3 English words that are a brand or part of a name and are NOT in the cuisine list (starbucks, joe's). Never generic words like restaurant, food, place, good, best, cheap, open, late.
- openNow: true only when the person wants somewhere open right now.
- openAt: use when they name a time or day: {"day":"today|tomorrow|Mon|Tue|Wed|Thu|Fri|Sat|Sun","time":"HH:MM"} in 24h. "open late" -> today 23:00. "after midnight" -> today 00:30. "breakfast" -> 08:00. "lunch" -> 12:30. "dinner" -> 19:30. "Sunday brunch" -> Sun 11:00. When openAt is set, openNow must be false.
- near: use when they name a neighborhood or landmark. Only {"place":"<exact name from the neighborhoods list>"}. If they name somewhere NOT in the list (Brooklyn neighborhoods, other cities), do not guess: leave near null and add that place to unsupported. "In Manhattan" needs no filter.
- unsupported: short phrases, in the person's language, for anything they asked that the data cannot answer (quiet, cozy, cheap, best rated, romantic, an uncovered neighborhood). Max 4.
- summary: ONE friendly sentence in the person's language saying what you are searching for, using only what you really applied. For features say "that list" them (they come from a volunteer map). Never claim a vibe, price or rating was applied.

RULES
- Do not invent requirements. If a field is not clearly requested, leave it empty, false or null.
- If nothing can be applied at all, return empty fields and explain in summary.
- Output JSON only.

EXAMPLES
"vegan pizza with outdoor seating near union square" ->
{"categories":[],"cuisines":["pizza"],"features":["vegan","outdoor seating"],"terms":[],"openNow":false,"openAt":null,"near":{"place":"Union Square"},"unsupported":[],"summary":"Pizza places near Union Square that list vegan options and outdoor seating."}

"quiet cafe to work on my laptop, open now" ->
{"categories":["Cafe"],"cuisines":[],"features":["wifi"],"terms":[],"openNow":true,"openAt":null,"near":null,"unsupported":["quiet"],"summary":"Cafes that are open now and list WiFi. I can't check how quiet they are."}

"یه رستوران ایتالیایی دنج نزدیک تایمز اسکوئر که الان بازه" ->
{"categories":["Restaurant"],"cuisines":["italian"],"features":[],"terms":[],"openNow":true,"openAt":null,"near":{"place":"Times Square"},"unsupported":["دنج"],"summary":"رستوران‌های ایتالیایی نزدیک تایمز اسکوئر که الان بازن. درباره‌ی دنج بودن اطلاعاتی ندارم."}

"late night sushi in park slope" ->
{"categories":[],"cuisines":["sushi"],"features":[],"terms":[],"openNow":false,"openAt":{"day":"today","time":"23:00"},"near":null,"unsupported":["Park Slope"],"summary":"Sushi places open late. I don't have data for Park Slope, so I'm not filtering by area."}`;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function cleanTerm(value: string): string | null {
  const term = value.trim().toLowerCase().replace(/\s+/g, " ");

  if (term.length < 2 || term.length > 30) return null;
  if (!/[a-z]/.test(term)) return null; // names are English
  if (!/^[\p{L}\p{N}][\p{L}\p{N} '&.-]*$/u.test(term)) return null;
  if (GENERIC_TERMS.has(term)) return null;

  return term;
}

function parseOpenAt(value: unknown, now: Date): SearchOpenAt | undefined {
  if (!value || typeof value !== "object") return undefined;

  const data = value as Record<string, unknown>;
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(data.time ?? "").trim());

  if (!timeMatch) return undefined;

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) return undefined;

  const today = localTime(now).day;
  const rawDay = String(data.day ?? "today").trim().toLowerCase();

  let day: number;

  if (rawDay === "today" || rawDay === "tonight" || rawDay === "") {
    day = today;
  } else if (rawDay === "tomorrow") {
    day = (today + 1) % 7;
  } else if (rawDay in DAY_ALIASES) {
    day = DAY_ALIASES[rawDay];
  } else {
    return undefined;
  }

  const minute = hours * 60 + minutes;
  const clock = formatTime(minute);

  return {
    day,
    minute,
    label: day === today ? clock : `${DAY_NAMES[day]} ${clock}`,
  };
}

function parseNear(value: unknown, areas: Area[]): SearchNear | undefined {
  if (!value || typeof value !== "object") return undefined;

  const data = value as Record<string, unknown>;

  // Only places we know. Coordinates made up by the model are not trusted.
  if (typeof data.place !== "string") return undefined;

  const area = findAreaByKey(data.place, areas);

  if (!area) return undefined;

  return {
    label: area.key,
    lat: area.lat,
    lng: area.lng,
    radiusKm: area.radiusKm,
  };
}

/** Checks everything the model said against what the data supports. */
export function normalizeAiIntent(
  value: unknown,
  query: string,
  context: SearchContext,
  now: Date = new Date(),
): SearchIntent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI returned an invalid intent.");
  }

  const data = value as Record<string, unknown>;

  const categories = Array.from(
    new Set(
      toStringArray(data.categories).flatMap((name) => {
        const match = context.categories.find(
          (category) => category.toLowerCase() === name.trim().toLowerCase(),
        );

        return match ? [match] : [];
      }),
    ),
  );

  const terms = Array.from(
    new Set(
      toStringArray(data.terms).flatMap((term) => {
        const cleaned = cleanTerm(term);
        return cleaned ? [cleaned] : [];
      }),
    ),
  ).slice(0, 4);

  // Only tags that exist in the data. "coffee" is a category, not a cuisine.
  const cuisines = Array.from(
    new Set(
      toStringArray(data.cuisines).flatMap((value) => {
        const wanted = value.trim().toLowerCase();
        const match = context.cuisines.find((tag) => tag === wanted);

        return match && !parseSearchIntent(match).category ? [match] : [];
      }),
    ),
  ).slice(0, 3);

  const features = Array.from(
    new Set(
      toStringArray(data.features).flatMap((value) => {
        const wanted = value.trim().toLowerCase();
        const match = context.features.find((tag) => tag === wanted);

        return match ? [match] : [];
      }),
    ),
  ).slice(0, 4);

  const openAt = parseOpenAt(data.openAt, now);
  const near = parseNear(data.near, context.areas);

  const unsupported = toStringArray(data.unsupported)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 40)
    .slice(0, 4);

  const summary =
    typeof data.summary === "string" && data.summary.trim().length > 0
      ? data.summary.trim().slice(0, 240)
      : undefined;

  return {
    query: query.trim(),
    category: categories[0],
    categories,
    tags: [],
    sort: near ? "distance" : "recommended",
    cuisines,
    features,
    terms,
    openNow: openAt ? false : data.openNow === true,
    openAt,
    near,
    unsupported,
    summary,
    source: "ai",
  };
}

function extractJson(content: string): unknown {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw new Error("AI returned no JSON.");
  }

  try {
    return JSON.parse(content.slice(start, end + 1));
  } catch {
    throw new Error("AI returned invalid JSON.");
  }
}

type Complete = (system: string, user: string) => Promise<string>;

const CACHE_LIMIT = 200;

/**
 * Builds an extractor around any function that asks a model for text. The
 * model's raw answer is cached per request, so the same search does not call
 * the AI twice. Only the raw answer is cached: relative words like "tomorrow"
 * are resolved again on every search.
 */
export function createAiIntentExtractor(
  complete: Complete,
): SearchIntentExtractor {
  const cache = new Map<string, unknown>();

  return {
    async extract(query, context, hooks) {
      if (!context) throw new Error("AI search needs the data context.");

      const key = [
        query.trim().toLowerCase(),
        context.categories.join(","),
        context.areas.map((area) => area.key).join(","),
        context.cuisines.join(","),
        context.features.join(","),
      ].join("|");

      let raw = cache.get(key);

      if (raw === undefined) {
        // only a cache miss costs money, so only here the limits apply
        hooks?.beforeModelCall?.();

        const content = await complete(buildSystemPrompt(context), query);
        raw = extractJson(content);
      }

      const intent = normalizeAiIntent(raw, query, context);

      // Only remember answers that passed validation.
      if (!cache.has(key)) {
        if (cache.size >= CACHE_LIMIT) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }

        cache.set(key, raw);
      }

      return intent;
    },
  };
}

export function isAiConfigured(): boolean {
  return Boolean(
    process.env.XAI_API_KEY &&
      process.env.XAI_BASE_URL &&
      process.env.XAI_MODEL,
  );
}

async function completeWithProvider(
  system: string,
  user: string,
): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  const baseURL = process.env.XAI_BASE_URL;
  const model = process.env.XAI_MODEL;

  if (!apiKey || !baseURL || !model) {
    throw new Error("AI environment variables are missing.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 12_000,
    maxRetries: 0,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user.slice(0, 500) },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
    max_tokens: 400,
  });

  const content = response.choices[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("AI provider returned no content.");
  }

  return content;
}

export const aiIntentExtractor = createAiIntentExtractor(completeWithProvider);
