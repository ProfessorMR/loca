"use client";

import type { CategoryCount } from "@/types/place";

type ExploreFiltersProps = {
  categories: CategoryCount[];
  selectedCategory: string;
  openNow: boolean;
  onCategoryChange: (category: string) => void;
  onOpenNowChange: (openNow: boolean) => void;
};

const pillBase =
  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors";
const pillIdle =
  "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground";

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
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {options.map(({ name, count }) => {
          const isSelected = selectedCategory === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onCategoryChange(name)}
              aria-pressed={isSelected}
              className={`${pillBase} ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : pillIdle
              }`}
            >
              {name}

              <span className="ml-2 text-xs tabular-nums opacity-60">
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
        className={`${pillBase} inline-flex items-center gap-2 self-start sm:self-auto ${
          openNow
            ? "border-emerald-600 bg-emerald-600 text-white"
            : pillIdle
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${
            openNow ? "bg-white" : "bg-emerald-500"
          }`}
        />
        Open now
      </button>
    </div>
  );
}
