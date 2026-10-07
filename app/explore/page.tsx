import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ExploreResults } from "@/components/shared/explore-results";
import { SearchBar } from "@/components/shared/search-bar";
import { searchPlaces } from "@/lib/places";

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
              ? `${resultsCount} ${
                  resultsCount === 1 ? "place" : "places"
                } found`
              : "Search for places based on what you're looking for."}
          </p>
        </div>

        <div className="my-10">
          <SearchBar initialQuery={query} />
        </div>

        <Suspense
          fallback={
            <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="h-96 animate-pulse rounded-2xl bg-muted" />
              <div className="hidden h-[600px] animate-pulse rounded-3xl bg-muted lg:block" />
            </div>
          }
        >
          <ExploreResults places={results} />
        </Suspense>
      </div>
    </main>
  );
}
