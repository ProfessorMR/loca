"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ExploreFilters } from "@/components/shared/explore-filters";
import { Map } from "@/components/shared/map";
import { PlaceCard } from "@/components/shared/place-card";
import type { Place } from "@/types/place";

type ExploreResultsProps = {
  places: Place[];
};

export function ExploreResults({ places }: ExploreResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const selectedCategory = searchParams.get("category") ?? "All";
  const selectedSort = searchParams.get("sort") ?? "recommended";
  const query = searchParams.get("q")?.trim() ?? "";

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === "All") {
      return places;
    }

    return places.filter(
      (place) =>
        place.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [places, selectedCategory]);

  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    setSelectedPlaceId(null);

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleSortChange(sort: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (sort === "recommended") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    setSelectedPlaceId(null);

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const displayedPlaces = useMemo(() => {
    const sortedPlaces = [...filteredPlaces];

    switch (selectedSort) {
      case "rating":
        return sortedPlaces.sort((a, b) => b.rating - a.rating);

      case "distance":
        return sortedPlaces.sort(
          (a, b) =>
            Number.parseFloat(a.distance) - Number.parseFloat(b.distance),
        );

      default:
        return sortedPlaces;
    }
  }, [filteredPlaces, selectedSort]);

  return (
    <div className="mt-12">
      <ExploreFilters
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Places</h2>

            <span className="text-sm text-muted-foreground">
              {displayedPlaces.length}{" "}
              {displayedPlaces.length === 1 ? "place" : "places"}
            </span>
          </div>

          {displayedPlaces.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {displayedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedPlaceId === place.id}
                  onHover={() => setSelectedPlaceId(place.id)}
                  onClick={() => setSelectedPlaceId(place.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border bg-muted/20 p-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                <span className="text-lg">⌕</span>
              </div>

              <h2 className="mt-5 text-lg font-semibold tracking-tight">
                No places found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {query
                  ? `We couldn't find any places matching "${query}".`
                  : "We couldn't find any places matching your current filters."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Cafe", "Restaurant", "Park"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("q", suggestion);
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    Try {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-6 h-[600px] overflow-hidden rounded-3xl border">
            <Map
              places={displayedPlaces}
              selectedPlaceId={selectedPlaceId}
              onPlaceHover={setSelectedPlaceId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
