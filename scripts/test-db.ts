import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.place.count();

  const osmPlaces = await prisma.place.count({
    where: { source: "openstreetmap" },
  });

  const categories = await prisma.place.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { category: "asc" },
  });

  console.log({ total, osmPlaces, categories });
}

main()
  .catch((error) => {
    console.error("Database test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
