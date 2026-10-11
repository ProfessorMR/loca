"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { List, Map as MapIcon } from "lucide-react";

import { ExploreFilters } from "@/components/shared/explore-filters";
import { Map } from "@/components/shared/map";
import { PlaceCard } from "@/components/shared/place-card";
import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type ExploreResultsProps = {
  places: Place[];
  intent: SearchIntent | null;
  categories: string[];
};

export function ExploreResults({
  places,
  intent,
  categories,
}: ExploreResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const selectedCategory = searchParams.get("category") ?? "All";
  const selectedSort = searchParams.get("sort") ?? "recommended";
  const query = searchParams.get("q")?.trim() ?? "";
  const selectedPrice = searchParams.get("price") ?? "all";

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory =
        selectedCategory === "All" || place.category === selectedCategory;

      const matchesPrice =
        selectedPrice === "all" || place.priceLevel === selectedPrice;

      return matchesCategory && matchesPrice;
    });
  }, [places, selectedCategory, selectedPrice]);

  function updateSearchParams(
    key: string,
    value: string,
    defaultValue: string,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    setSelectedPlaceId(null);

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const displayedPlaces = useMemo(() => {
    const sortedPlaces = [...filteredPlaces];

    switch (selectedSort) {
      case "rating":
        return sortedPlaces.sort(
          (a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity),
        );

      case "distance": {
        const parseDistance = (distance: string | null) => {
          if (!distance) return Infinity;

          const value = Number.parseFloat(distance);
          return Number.isFinite(value) ? value : Infinity;
        };

        return sortedPlaces.sort(
          (a, b) => parseDistance(a.distance) - parseDistance(b.distance),
        );
      }

      default:
        return sortedPlaces;
    }
  }, [filteredPlaces, selectedSort]);

  return (
    <div className="mt-12">
      <ExploreFilters
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        selectedPrice={selectedPrice}
        onCategoryChange={(category) =>
          updateSearchParams("category", category, "All")
        }
        onSortChange={(sort) => updateSearchParams("sort", sort, "recommended")}
        onPriceChange={(price) => updateSearchParams("price", price, "all")}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Places</h2>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {displayedPlaces.length}{" "}
                {displayedPlaces.length === 1 ? "place" : "places"}
              </span>

              <button
                type="button"
                onClick={() => setShowMobileMap((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm transition-colors hover:border-foreground/30 lg:hidden"
              >
                {showMobileMap ? (
                  <>
                    <List className="size-4" />
                    List
                  </>
                ) : (
                  <>
                    <MapIcon className="size-4" />
                    Map
                  </>
                )}
              </button>
            </div>
          </div>

          {showMobileMap && (
            <div className="mt-5 h-[min(65vh,560px)] min-h-[360px] overflow-hidden rounded-3xl border lg:hidden">
              <Map
                places={displayedPlaces}
                selectedPlaceId={selectedPlaceId}
                onPlaceHover={setSelectedPlaceId}
              />
            </div>
          )}

          {displayedPlaces.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {displayedPlaces.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  intent={intent ?? undefined}
                  isPriority={index === 0}
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
                {query ? "Nothing matched your search" : "No places found"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {query
                  ? `We couldn't find any places matching "${query}". Try a broader search or explore one of these categories.`
                  : "Try changing your filters or explore one of these categories."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Cafe", "Restaurant", "Park"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.delete("q");
                      params.delete("price");
                      params.set("category", suggestion);

                      const queryString = params.toString();
                      router.push(
                        queryString ? `${pathname}?${queryString}` : pathname,
                      );
                      setSelectedPlaceId(null);
                    }}
                    className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    Try {suggestion}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlaceId(null);
                  router.push(pathname);
                }}
                className="mt-4 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
              >
                Clear search and filters
              </button>
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
