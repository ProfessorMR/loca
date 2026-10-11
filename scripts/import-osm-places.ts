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

const BOUNDS = {
  south: 35.665,
  west: 51.365,
  north: 35.715,
  east: 51.445,
};

const overpassQuery = `
[out:json][timeout:60];
(
  node["amenity"~"^(cafe|restaurant|fast_food|ice_cream)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  way["amenity"~"^(cafe|restaurant|fast_food|ice_cream)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  relation["amenity"~"^(cafe|restaurant|fast_food|ice_cream)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

  node["leisure"="park"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  way["leisure"="park"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  relation["leisure"="park"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});

  node["tourism"~"^(museum|attraction|gallery)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  way["tourism"~"^(museum|attraction|gallery)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
  relation["tourism"~"^(museum|attraction|gallery)$"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
);
out center tags;
`;

type OSMElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function getCategory(tags: Record<string, string>): string {
  if (tags.amenity === "cafe") return "Cafe";

  if (
    tags.amenity === "restaurant" ||
    tags.amenity === "fast_food" ||
    tags.amenity === "ice_cream"
  ) {
    return "Restaurant";
  }

  if (tags.leisure === "park") return "Park";
  if (tags.tourism === "museum") return "Museum";
  if (tags.tourism === "gallery") return "Gallery";

  return "Attraction";
}

function getCoordinates(element: OSMElement) {
  if (element.type === "node") {
    return {
      latitude: element.lat,
      longitude: element.lon,
    };
  }

  return {
    latitude: element.center?.lat,
    longitude: element.center?.lon,
  };
}

function clean(value?: string): string | null {
  const result = value?.trim();
  return result ? result : null;
}

function getImageUrl(value?: string): string | null {
  const image = clean(value);
  if (!image) return null;

  try {
    const url = new URL(image);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    // The value may be a filename rather than a URL.
  }

  return null;
}

async function main() {
  console.log("Fetching places from OpenStreetMap...");

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "LOCA local discovery app",
    },
    body: new URLSearchParams({ data: overpassQuery }),
    signal: AbortSignal.timeout(75_000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    elements: OSMElement[];
  };

  const elements = data.elements ?? [];

  console.log(`Received ${elements.length} OSM elements.`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const element of elements) {
    const tags = element.tags ?? {};
    const name = clean(tags.name);
    const { latitude, longitude } = getCoordinates(element);

    if (
      !name ||
      latitude === undefined ||
      longitude === undefined ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      skipped++;
      continue;
    }

    const osmId = `${element.type}/${element.id}`;
    const category = getCategory(tags);

    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:city"],
      tags["addr:postcode"],
    ]
      .map(clean)
      .filter((part): part is string => part !== null);

    const address = addressParts.length > 0 ? addressParts.join(", ") : null;

    const description =
      clean(tags.description) ?? clean(tags["description:en"]);

    const image = getImageUrl(tags.image);
    const website = clean(tags.website) ?? clean(tags["contact:website"]);
    const phone = clean(tags.phone) ?? clean(tags["contact:phone"]);
    const openingHours = clean(tags.opening_hours);
    const wikimediaCommons = clean(tags.wikimedia_commons);

    const tagsForPlace = [
      tags.amenity,
      tags.leisure,
      tags.tourism,
      tags.cuisine,
      tags.wheelchair === "yes" ? "wheelchair accessible" : undefined,
      tags.outdoor_seating === "yes" ? "outdoor seating" : undefined,
    ].filter((tag): tag is string => Boolean(tag));

    try {
      await prisma.place.upsert({
        where: { osmId },

        update: {
          source: "openstreetmap",
          name,
          category,
          tags: tagsForPlace,
          latitude,
          longitude,

          ...(address && { address }),
          ...(description && { description }),
          ...(image && { image }),
          ...(website && { website }),
          ...(phone && { phone }),
          ...(openingHours && { openingHours }),
          ...(wikimediaCommons && { wikimediaCommons }),
        },

        create: {
          osmId,
          source: "openstreetmap",
          name,
          category,
          tags: tagsForPlace,
          latitude,
          longitude,

          address,
          description,
          image,
          website,
          phone,
          openingHours,
          wikimediaCommons,

          // No verified rating or price data is available here.
          rating: null,
          priceLevel: null,
          distance: null,
        },
      });

      imported++;

      if (imported % 25 === 0) {
        console.log(`Processed ${imported} places...`);
      }
    } catch (error) {
      failed++;
      console.error(`Failed to import ${osmId}:`, error);
    }
  }

  console.log("\nImport completed.");
  console.log(`Processed: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("OSM import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
