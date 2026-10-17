import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import fs from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../app/generated/prisma/client";
import { buildPlaceTags } from "../lib/osm-tags";

/**
 * Fills Place.tags (cuisine, outdoor seating, wifi, vegan...) from the
 * OpenStreetMap data you already have in new-york-places.geojson.
 *
 * It ONLY updates the tags column of places that already exist in the
 * database, matched by osmId. Nothing else is touched, and running it again
 * is safe.
 *
 * Usage:
 *   npx tsx scripts/enrich-tags.ts --dry-run   (just show what would happen)
 *   npx tsx scripts/enrich-tags.ts
 */

const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 10;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Feature = {
  id?: string;
  properties?: Record<string, unknown>;
};

async function main() {
  const file = path.resolve(process.cwd(), "new-york-places.geojson");
  const geojson = JSON.parse(fs.readFileSync(file, "utf8")) as {
    features?: Feature[];
  };

  if (!Array.isArray(geojson.features)) {
    throw new Error("Invalid GeoJSON: features array not found.");
  }

  const jobs: { osmId: string; tags: string[] }[] = [];
  const tagCounts = new Map<string, number>();

  for (const feature of geojson.features) {
    const props = feature.properties ?? {};
    const osmId = String(feature.id ?? props["@id"] ?? "");

    if (!osmId || !props.name) continue;

    const tags = buildPlaceTags(props);
    if (tags.length === 0) continue;

    jobs.push({ osmId, tags });

    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  console.log(`Places with at least one tag: ${jobs.length}`);
  console.log(
    "Most common tags:",
    [...tagCounts]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([tag, count]) => `${tag} (${count})`)
      .join(", "),
  );

  if (DRY_RUN) {
    console.log("\nDry run: nothing was written. Example:", jobs[0]);
    return;
  }

  let updated = 0;
  let missing = 0;
  let failed = 0;
  let done = 0;
  const queue = [...jobs];

  async function worker() {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) break;

      try {
        const result = await prisma.place.updateMany({
          where: { osmId: job.osmId },
          data: { tags: { set: job.tags } },
        });

        if (result.count > 0) updated++;
        else missing++;
      } catch (error) {
        failed++;
        console.error(`Failed to update ${job.osmId}:`, error);
      }

      done++;
      if (done % 500 === 0) console.log(`Progress: ${done}/${jobs.length}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log("\nTag update finished.");
  console.log(`Updated:               ${updated}`);
  console.log(`Not in the database:   ${missing}`);
  console.log(`Failed:                ${failed}`);
}

main()
  .catch((error) => {
    console.error("Tag update failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
