"use client";

import { useMemo, useState } from "react";

import { ExploreFilters } from "@/components/shared/explore-filters";
import { Map } from "@/components/shared/map";
import { PlaceCard } from "@/components/shared/place-card";
import type { Place } from "@/types/place";

type ExploreResultsProps = {
  places: Place[];
};

export function ExploreResults({ places }: ExploreResultsProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("recommended");

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
    setSelectedCategory(category);
    setSelectedPlaceId(null);
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
        onCategoryChange={handleCategoryChange}
        onSortChange={setSelectedSort}
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
                  onLeave={() => setSelectedPlaceId(null)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border p-10 text-center">
              <h2 className="font-semibold">No places found</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Try another category.
              </p>
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
