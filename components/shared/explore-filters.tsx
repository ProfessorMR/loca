"use client";

import { ChevronDown } from "lucide-react";
import { getPlaceCategories } from "@/lib/places";

const priceOptions = [
  { label: "Any price", value: "all" },
  { label: "$", value: "$" },
  { label: "$$", value: "$$" },
  { label: "$$$", value: "$$$" },
];

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest rated", value: "rating" },
  { label: "Closest", value: "distance" },
];

type ExploreFiltersProps = {
  selectedCategory: string;
  selectedSort: string;
  selectedPrice: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onPriceChange: (price: string) => void;
};

export function ExploreFilters({
  selectedCategory,
  selectedSort,
  selectedPrice,
  onCategoryChange,
  onSortChange,
  onPriceChange,
}: ExploreFiltersProps) {
  const categories = ["All", ...getPlaceCategories()];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <div className="relative">
          <select
            value={selectedPrice}
            onChange={(event) => onPriceChange(event.target.value)}
            className="h-10 appearance-none rounded-full border bg-background py-2 pl-4 pr-10 text-sm font-medium outline-none transition-colors hover:border-foreground/30 focus:border-foreground"
            aria-label="Filter by price"
          >
            {priceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="relative">
          <select
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-10 appearance-none rounded-full border bg-background py-2 pl-4 pr-10 text-sm font-medium outline-none transition-colors hover:border-foreground/30 focus:border-foreground"
            aria-label="Sort places"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
