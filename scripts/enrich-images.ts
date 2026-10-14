import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const USER_AGENT =
  "LOCA-image-enricher/1.0 (local discovery app; github.com/loca)";

const COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php";

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));

  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : undefined;
}

const HAS_FLAG = (name: string) => args.includes(`--${name}`);

const DRY_RUN = HAS_FLAG("dry-run");
const LIMIT = Number.parseInt(getArg("limit") ?? "0", 10);
const RADIUS = Number.parseInt(getArg("radius") ?? "75", 10);
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(getArg("concurrency") ?? "2", 10),
);
const DELAY = Math.max(
  0,
  Number.parseInt(getArg("delay") ?? "800", 10),
);

const NAME_STOPWORDS = new Set([
  "restaurant",
  "restaurants",
  "cafe",
  "cafes",
  "coffee",
  "bar",
  "grill",
  "kitchen",
  "food",
  "pizza",
  "deli",
  "bakery",
  "diner",
  "chicken",
  "sushi",
  "noodle",
  "thai",
  "chinese",
  "japanese",
  "korean",
  "italian",
  "mexican",
  "house",
  "shop",
  "store",
  "the",
  "and",
]);

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0600-\u06FF ]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function distinctiveTokens(name: string): string[] {
  return Array.from(new Set(normalizeTokens(name))).filter(
    (token) => token.length >= 5 && !NAME_STOPWORDS.has(token),
  );
}

function titleMatchesName(title: string, name: string): boolean {
  const tokens = distinctiveTokens(name);

  if (tokens.length === 0) return false;

  const normalizedTitle = normalizeTokens(title).join(" ");

  return tokens.some((token) => normalizedTitle.includes(token));
}

type ExtMetadata = Record<string, { value?: string } | undefined>;

type ImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
  extmetadata?: ExtMetadata;
};

type CommonsPage = {
  title?: string;
  imageinfo?: ImageInfo[];
};

type CommonsResponse = {
  query?: {
    pages?: CommonsPage[];
  };
};

type FoundImage = {
  image: string;
  license: string | null;
  attribution: string | null;
};

function stripHtml(value: string | undefined): string | null {
  if (!value) return null;

  const text = value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0 ? text : null;
}

function isUsableMime(mime: string | undefined): boolean {
  if (!mime) return false;
  if (!mime.startsWith("image/")) return false;

  return mime !== "image/svg+xml";
}

async function fetchCommons(
  latitude: number,
  longitude: number,
): Promise<CommonsResponse> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "geosearch",
    ggscoord: `${latitude}|${longitude}`,
    ggsradius: String(RADIUS),
    ggslimit: "5",
    ggsnamespace: "6",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "1024",
  });

  const url = `${COMMONS_ENDPOINT}?${params.toString()}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });

    if (response.status === 429) {
      await sleep(2_000 * 2 ** attempt);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Commons returned HTTP ${response.status}`);
    }

    return (await response.json()) as CommonsResponse;
  }

  throw new Error("Commons rate limited (HTTP 429)");
}

async function findCommonsImage(
  latitude: number,
  longitude: number,
  name: string,
): Promise<FoundImage | null> {
  const data = await fetchCommons(latitude, longitude);
  const pages = data.query?.pages ?? [];

  for (const page of pages) {
    const info = page.imageinfo?.[0];

    if (!info || !isUsableMime(info.mime)) continue;
    if (!page.title || !titleMatchesName(page.title, name)) continue;

    const url = info.thumburl ?? info.url;

    if (!url) continue;

    const meta = info.extmetadata ?? {};
    const license = meta.LicenseShortName?.value?.trim() ?? null;
    const artist = stripHtml(meta.Artist?.value) ?? null;

    const attributionParts = [artist, license].filter(
      (part): part is string => Boolean(part),
    );

    return {
      image: url,
      license,
      attribution:
        attributionParts.length > 0 ? attributionParts.join(" — ") : null,
    };
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const where = {
    image: null,
    latitude: { not: null },
    longitude: { not: null },
  };

  const total = await prisma.place.count({ where });

  const places = await prisma.place.findMany({
    where,
    select: { id: true, name: true, latitude: true, longitude: true },
    orderBy: { createdAt: "asc" },
    ...(LIMIT > 0 ? { take: LIMIT } : {}),
  });

  console.log(
    `Places missing images: ${total}. Processing ${places.length} ` +
      `(radius=${RADIUS}m, concurrency=${CONCURRENCY}, delay=${DELAY}ms, dryRun=${DRY_RUN}).`,
  );

  let processed = 0;
  let enriched = 0;
  let missed = 0;
  let failed = 0;

  const queue = [...places];

  async function worker(workerId: number) {
    while (queue.length > 0) {
      const place = queue.shift();
      if (!place) break;

      const latitude = place.latitude as number;
      const longitude = place.longitude as number;

      try {
        const found = await findCommonsImage(
          latitude,
          longitude,
          place.name,
        );

        if (found) {
          enriched++;

          if (!DRY_RUN) {
            await prisma.place.update({
              where: { id: place.id },
              data: {
                image: found.image,
                imageSource: "wikimedia",
                imageAttribution: found.attribution,
                imageLicense: found.license,
              },
            });
          }

          console.log(
            `[w${workerId}] + ${place.name} -> ${found.image}`,
          );
        } else {
          missed++;
        }
      } catch (error) {
        failed++;
        console.error(
          `[w${workerId}] ! ${place.name}:`,
          error instanceof Error ? error.message : error,
        );
      } finally {
        processed++;

        if (processed % 100 === 0) {
          console.log(
            `Progress: ${processed}/${places.length} ` +
              `(enriched=${enriched}, missed=${missed}, failed=${failed})`,
          );
        }

        await sleep(DELAY);
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, index) => worker(index + 1)),
  );

  console.log("\nImage enrichment completed.");
  console.log(`Processed: ${processed}`);
  console.log(`Enriched: ${enriched}`);
  console.log(`Missed: ${missed}`);
  console.log(`Failed: ${failed}`);
  console.log(DRY_RUN ? "(dry run: no database writes)" : "(writes applied)");
}

main()
  .catch((error) => {
    console.error("Image enrichment failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
