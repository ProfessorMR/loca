import OpenAI from "openai";

import type { SearchIntent } from "@/types/search";
import type { SearchIntentExtractor } from "@/lib/search-intent-extractor";

const VALID_CATEGORIES = ["Restaurant", "Cafe", "Bar", "Hotel", "Park"];
const VALID_PRICE_LEVELS = ["$", "$$", "$$$", "Free"];

const ALLOWED_TAGS = new Set([
  "quiet",
  "work-friendly",
  "date",
  "dinner",
  "cozy",
  "casual",
  "nature",
  "relaxing",
  "outdoor",
  "coffee",
  "food",
]);

const SYSTEM_PROMPT = `
You extract search intent for a local discovery app called LOCA.

Return only a valid JSON object:
{
  "category": "Restaurant | Cafe | Bar | Hotel | Park | null",
  "tags": [],
  "priceLevel": "$ | $$ | $$$ | Free | null"
}

Rules:
- Infer category only when the query gives enough evidence.
- Allowed tags: quiet, work-friendly, date, dinner, cozy, casual,
  nature, relaxing, outdoor, coffee, food.
- Use "$" for cheap or affordable, "$$$" for expensive, and "Free" for free places.
- Use null when category or price is not specified.
- Do not invent requirements.
- Return JSON only.
`;

function normalizeIntent(value: unknown, originalQuery: string): SearchIntent {
  if (!value || typeof value !== "object") {
    throw new Error("AI returned an invalid intent.");
  }

  const data = value as Record<string, unknown>;

  const category =
    typeof data.category === "string" &&
    VALID_CATEGORIES.includes(data.category)
      ? data.category
      : undefined;

  const priceLevel =
    typeof data.priceLevel === "string" &&
    VALID_PRICE_LEVELS.includes(data.priceLevel)
      ? data.priceLevel
      : undefined;

  const tags = Array.isArray(data.tags)
    ? data.tags.filter(
        (tag): tag is string =>
          typeof tag === "string" && ALLOWED_TAGS.has(tag),
      )
    : [];

  return {
    query: originalQuery.trim(),
    category,
    tags: Array.from(new Set(tags)),
    priceLevel,
    sort: "recommended",
  };
}

export const aiIntentExtractor: SearchIntentExtractor = {
  async extract(query) {
    const apiKey = process.env.XAI_API_KEY;
    const baseURL = process.env.XAI_BASE_URL;
    const model = process.env.XAI_MODEL;

    if (!apiKey || !baseURL || !model) {
      throw new Error("AI environment variables are missing.");
    }

    const client = new OpenAI({
      apiKey,
      baseURL,
      timeout: 20_000,
      maxRetries: 0,
    });

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error("AI provider returned no content.");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid JSON.");
    }

    return normalizeIntent(parsed, query);
  },
};
