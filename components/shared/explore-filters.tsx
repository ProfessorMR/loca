"use client";

import { getCategoryColor } from "@/lib/category-colors";
import { getCategoryLabel } from "@/lib/category-labels";
import type { CategoryCount } from "@/types/place";

type ExploreFiltersProps = {
  categories: CategoryCount[];
  selectedCategory: string;
  openNow: boolean;
  onCategoryChange: (category: string) => void;
  onOpenNowChange: (openNow: boolean) => void;
};

const pill =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors";
const idle = "bg-card text-foreground hover:border-foreground";

export function ExploreFilters({
  categories,
  selectedCategory,
  openNow,
  onCategoryChange,
  onOpenNowChange,
}: ExploreFiltersProps) {
  const total = categories.reduce((sum, category) => sum + category.count, 0);

  const options = [
    { name: "All", count: total },
    ...categories.map(({ name, count }) => ({ name, count })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div
        role="group"
        aria-label="Category"
        className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
      >
        {options.map(({ name, count }) => {
          const isSelected = selectedCategory === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onCategoryChange(name)}
              aria-pressed={isSelected}
              className={`${pill} ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : idle
              }`}
            >
              {name !== "All" && (
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: getCategoryColor(name) }}
                />
              )}

              {name === "All" ? "All" : getCategoryLabel(name)}

              <span
                className={`tabular text-xs ${
                  isSelected ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                {count.toLocaleString("en-US")}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onOpenNowChange(!openNow)}
        aria-pressed={openNow}
        className={`${pill} self-start sm:self-auto ${
          openNow
            ? "border-signal bg-signal text-signal-foreground"
            : idle
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${
            openNow ? "bg-foreground" : "bg-open"
          }`}
        />
        Open now
      </button>
    </div>
  );
}
