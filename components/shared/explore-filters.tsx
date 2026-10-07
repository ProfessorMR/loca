"use client";

import { ChevronDown } from "lucide-react";

const categories = ["All", "Restaurant", "Cafe", "Bar", "Park", "Hotel"];

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest rated", value: "rating" },
  { label: "Closest", value: "distance" },
];

type ExploreFiltersProps = {
  selectedCategory: string;
  selectedSort: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
};

export function ExploreFilters({
  selectedCategory,
  selectedSort,
  onCategoryChange,
  onSortChange,
}: ExploreFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-2">
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

      <div className="relative shrink-0">
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
  );
}
