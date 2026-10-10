import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ExploreResults } from "@/components/shared/explore-results";
import { SearchBar } from "@/components/shared/search-bar";
import { searchPlaces } from "@/lib/places";
import { SearchSuggestions } from "@/components/shared/search-suggestions";

type ExploreContentProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export async function ExploreContent({ searchParams }: ExploreContentProps) {
  await connection();

  const params = await searchParams;
  const query = params.q ?? "";

  const results = await searchPlaces(query);
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
          {!query && <SearchSuggestions />}
        </div>

        <ExploreResults places={results} />
      </div>
    </main>
  );
}
