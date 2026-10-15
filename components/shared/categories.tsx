import { Coffee, Sandwich, Store, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { getCategoryLabel } from "@/lib/category-labels";
import { getCategoryCounts, getPopularSearchTerms } from "@/lib/places";

// Icons for the categories that exist in the data. Any new category added to
// the database still shows up, with a generic icon.
const categoryIcons: Record<string, LucideIcon> = {
  Restaurant: Utensils,
  "Fast Food": Sandwich,
  Cafe: Coffee,
};

export async function Categories() {
  const [categories, popularSearches] = await Promise.all([
    getCategoryCounts(),
    getPopularSearchTerms(6),
  ]);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Explore</p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Browse by category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
        {categories.map(({ name, count }) => {
          const Icon = categoryIcons[name] ?? Store;

          return (
            <Link
              key={name}
              href={`/explore?category=${encodeURIComponent(name)}`}
              className="group flex min-h-36 flex-col justify-between rounded-2xl border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
            >
              <Icon
                className="size-6 text-muted-foreground transition-colors group-hover:text-emerald-600"
                aria-hidden="true"
              />

              <div>
                <span className="block text-sm font-medium">
                  {getCategoryLabel(name)}
                </span>

                <span className="mt-1 block text-sm tabular-nums text-muted-foreground">
                  {count.toLocaleString("en-US")}{" "}
                  {count === 1 ? "place" : "places"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {popularSearches.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">
            Popular searches:
          </span>

          {popularSearches.map((search) => (
            <Link
              key={search}
              href={`/explore?q=${encodeURIComponent(search)}`}
              className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {search}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
