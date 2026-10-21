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

  const pageSize = 24;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

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
    <div className="mt-6">
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
        aria-busy={isPending}
        className={`mt-6 grid gap-8 transition-opacity duration-200 lg:grid-cols-[minmax(0,1fr)_440px] ${
          isPending ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        <section>
          <div className="flex items-center justify-between gap-4">
            <div role="status" aria-live="polite">
              <h1 className="display tabular text-3xl">
                {totalCount.toLocaleString("en-US")}{" "}
                {totalCount === 1 ? "place" : "places"}
              </h1>

              <p className="mt-1.5 flex min-h-5 items-center gap-2 text-sm text-muted-foreground">
                {isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>{pendingLabel}</span>
                  </>
                ) : intent?.near ? (
                  `Nearest to ${intent.near.label} first`
                ) : totalCount > pageSize ? (
                  `Showing ${startIndex}–${endIndex}`
                ) : null}
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
              className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground disabled:opacity-50 lg:hidden"
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
            <div className="mt-5 h-[min(65vh,560px)] min-h-[360px] overflow-hidden rounded-2xl border lg:hidden">
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
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {places.map((place, index) => (
                  <div
                    key={place.id}
                    id={`place-${place.id}`}
                    className="h-full scroll-mt-24"
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
                    className="h-11 rounded-full border bg-card px-5 text-sm font-medium transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="tabular text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages || isPending}
                    onClick={() => goToPage(page + 1)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
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
            <div className="mt-5 rounded-2xl border border-dashed bg-card p-8 text-center sm:p-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-signal text-signal-foreground">
                <span className="text-lg">⌕</span>
              </div>

              <h2 className="display mt-5 text-2xl">
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
                    className="h-10 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
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
                    className="h-10 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground disabled:opacity-50"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={clearSearchAndFilters}
                className="mt-4 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                Clear search and all filters
              </button>
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24 h-[calc(100vh-7.5rem)] min-h-[420px] overflow-hidden rounded-2xl border bg-card">
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
