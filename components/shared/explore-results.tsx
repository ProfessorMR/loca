"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { List, LoaderCircle, Map as MapIcon } from "lucide-react";

import { ExploreFilters } from "@/components/shared/explore-filters";
import { useExploreNavigation } from "@/components/shared/explore-navigation";
import { Map } from "@/components/shared/map";
import { PlaceCard } from "@/components/shared/place-card";
import type { CategoryCount, Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type ExploreResultsProps = {
  places: Place[];
  intent: SearchIntent | null;
  categories: CategoryCount[];
  totalCount: number;
  page: number;
  totalPages: number;
};

export function ExploreResults({
  places,
  intent,
  categories,
  totalCount,
  page,
  totalPages,
}: ExploreResultsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigation = useExploreNavigation();

  if (!navigation) {
    throw new Error(
      "ExploreResults must be used inside ExploreNavigationProvider",
    );
  }

  // Shared with the search bar, so searching shows the same loading state.
  const { isPending, pendingLabel } = navigation;

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const selectedCategory = searchParams.get("category") ?? "All";
  const query = searchParams.get("q")?.trim() ?? "";
  const openNow = searchParams.get("open") === "1";

  const startIndex = totalCount === 0 ? 0 : (page - 1) * 24 + 1;
  const endIndex = Math.min(page * 24, totalCount);

  // A marker was clicked on the map: show its card in the list.
  function handleMarkerClick(placeId: string) {
    setSelectedPlaceId(placeId);

    document
      .getElementById(`place-${placeId}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function navigate(url: string) {
    setSelectedPlaceId(null);
    navigation?.navigate(url);
  }

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

    if (key !== "page") {
      params.delete("page");
    }

    const queryString = params.toString();
    navigate(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function clearSearch() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("q");
    params.delete("page");

    const queryString = params.toString();
    navigate(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function clearSearchAndFilters() {
    navigate(pathname);
  }

  function goToPage(nextPage: number) {
    updateSearchParams("page", String(nextPage), "1");
  }

  function selectCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    // Changing category starts a fresh category search.
    params.delete("q");
    params.delete("page");

    const queryString = params.toString();

    navigate(queryString ? `${pathname}?${queryString}` : pathname);
  }
  return (
    <div className="mt-12">
      <ExploreFilters
        categories={categories}
        selectedCategory={selectedCategory}
        openNow={openNow}
        onCategoryChange={selectCategory}
        onOpenNowChange={(value) =>
          updateSearchParams("open", value ? "1" : "", "")
        }
      />

      <div
        className="mt-5 flex min-h-6 items-center gap-2 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {isPending && (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            <span>{pendingLabel}</span>
          </>
        )}
      </div>

      <div
        aria-busy={isPending}
        className={`grid gap-8 transition-opacity duration-200 lg:grid-cols-[minmax(0,1fr)_420px] ${
          isPending ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Places</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalCount > 0
                  ? `Showing ${startIndex}–${endIndex} of ${totalCount} places`
                  : "0 places found"}
              </p>

              {openNow && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on listed opening hours (New York time). Places without
                  hours are not shown.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowMobileMap((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm transition-colors hover:border-foreground/30 disabled:opacity-50 lg:hidden"
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

          {showMobileMap && (
            <div className="mt-5 h-[min(65vh,560px)] min-h-[360px] overflow-hidden rounded-3xl border lg:hidden">
              <Map
                places={places}
                selectedPlaceId={selectedPlaceId}
                onPlaceHover={setSelectedPlaceId}
                onPlaceClick={handleMarkerClick}
              />
            </div>
          )}

          {places.length > 0 ? (
            <>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {places.map((place, index) => (
                  <div
                    key={place.id}
                    id={`place-${place.id}`}
                    className="scroll-mt-6"
                  >
                    <PlaceCard
                      place={place}
                      intent={intent ?? undefined}
                      isPriority={index === 0}
                      isSelected={selectedPlaceId === place.id}
                      onHover={() => setSelectedPlaceId(place.id)}
                      onClick={() => setSelectedPlaceId(place.id)}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Place result pages"
                  className="mt-8 flex items-center justify-between gap-4"
                >
                  <button
                    type="button"
                    disabled={page <= 1 || isPending}
                    onClick={() => goToPage(page - 1)}
                    className="rounded-full border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages || isPending}
                    onClick={() => goToPage(page + 1)}
                    className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    {isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="mt-5 rounded-3xl border bg-muted/20 p-8 text-center sm:p-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                <span className="text-lg">⌕</span>
              </div>

              <h2 className="mt-5 text-lg font-semibold tracking-tight">
                {query ? "No matching places" : "No places found"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {query
                  ? `No places matched "${query}" with your current filters. Try clearing the search or choosing another category.`
                  : "Try changing your filters to discover more places."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {query && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={clearSearch}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Clear search
                  </button>
                )}

                {categories.slice(0, 3).map(({ name }) => (
                  <button
                    key={name}
                    type="button"
                    disabled={isPending}
                    onClick={() => selectCategory(name)}
                    className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted disabled:opacity-50"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={clearSearchAndFilters}
                className="mt-4 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline disabled:opacity-50"
              >
                Clear search and all filters
              </button>
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-6 h-[600px] overflow-hidden rounded-3xl border">
            <Map
              places={places}
              selectedPlaceId={selectedPlaceId}
              onPlaceHover={setSelectedPlaceId}
              onPlaceClick={handleMarkerClick}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
