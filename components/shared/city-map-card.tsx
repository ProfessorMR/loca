import Link from "next/link";

import { CityMap } from "@/components/shared/city-map";
import { getCategoryColor } from "@/lib/category-colors";
import { getCategoryLabel } from "@/lib/category-labels";
import { getCategoryCounts, getMapDots } from "@/lib/places";

const frame =
  "overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_1px_0_rgba(19,32,58,0.04),0_24px_48px_-24px_rgba(19,32,58,0.22)]";

/** Placeholder with the same size while the real card loads. */
export function CityMapCardSkeleton() {
  return (
    <div className={frame} aria-hidden="true">
      <div className="h-[32rem] animate-pulse bg-muted/60 sm:h-[36rem] lg:h-[38rem]" />
    </div>
  );
}

/**
 * Every place in the database drawn as a dot in the color of its category.
 * The legend underneath doubles as the way into each category.
 */
export async function CityMapCard() {
  const [dots, categories] = await Promise.all([getMapDots(), getCategoryCounts()]);

  if (dots.total === 0) return null;

  const total = dots.total.toLocaleString("en-US");

  return (
    <div className={frame}>
      <div className="flex items-baseline justify-between px-6 pt-5">
        <p className="display text-3xl tabular">{total}</p>
        <p className="text-sm text-muted-foreground">places, each one a dot</p>
      </div>

      <div className="flex h-[24rem] justify-center px-6 py-4 sm:h-[28rem] lg:h-[29rem]">
        <CityMap
          categories={dots.categories}
          data={dots.data}
          aspect={dots.aspect}
          label={`Map of ${total} places, colored by category`}
        />
      </div>

      <ul className="grid grid-cols-3 divide-x border-t">
        {categories.slice(0, 3).map(({ name, count }) => (
          <li key={name}>
            <Link
              href={`/explore?category=${encodeURIComponent(name)}`}
              className="group flex flex-col gap-1 px-3 py-4 transition-colors hover:bg-secondary sm:px-6"
            >
              <span className="flex items-center gap-2 text-[0.8125rem] font-medium sm:text-sm">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getCategoryColor(name) }}
                />
                <span>{getCategoryLabel(name)}</span>
              </span>

              <span className="tabular pl-[1.125rem] text-[0.8125rem] text-muted-foreground sm:text-sm">
                {count.toLocaleString("en-US")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
