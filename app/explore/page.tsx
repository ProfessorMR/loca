import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { searchPlaces } from "@/lib/places";
import { PlaceCard } from "@/components/shared/place-card";

import { SearchBar } from "@/components/shared/search-bar";

import { Map } from "@/components/shared/map";

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = searchPlaces(query);
  const resultsCount = results.length;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div className="mt-12">
          <p className="text-sm font-medium text-emerald-600">Explore</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {query ? `Results for "${query}"` : "Find your next place."}
          </h1>

          <p className="mt-4 max-w-xl text-muted-foreground">
            {query
              ? `${resultsCount} ${resultsCount === 1 ? "place" : "places"} found`
              : "Search for places based on what you're looking for."}
          </p>
        </div>

        <div className="my-10">
          <SearchBar initialQuery={query} />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Places</h2>

              {query && (
                <span className="text-sm text-muted-foreground">
                  Sorted by relevance
                </span>
              )}
            </div>

            {results.length > 0 ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {results.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border p-10 text-center">
                <h2 className="font-semibold">No places found</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try searching for something different.
                </p>
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-6 h-[600px] overflow-hidden rounded-3xl border">
              <Map />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
