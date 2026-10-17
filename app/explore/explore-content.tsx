import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ExploreResults } from "@/components/shared/explore-results";
import { headers } from "next/headers";

import { SearchBar } from "@/components/shared/search-bar";
import { SearchUnderstanding } from "@/components/shared/search-understanding";
import { describeCategories } from "@/lib/category-labels";
import {
  getCategoryCounts,
  getSearchSuggestions,
  searchPlaces,
} from "@/lib/places";
import { SearchSuggestions } from "@/components/shared/search-suggestions";

type ExploreContentProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    open?: string;
  }>;
};

export async function ExploreContent({ searchParams }: ExploreContentProps) {
  await connection();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const category = params.category ?? "All";
  const openNow = params.open === "1";

  // Used only to limit how many AI searches one visitor can run.
  const requestHeaders = await headers();
  const clientKey =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  const [searchResult, categories, suggestions] = await Promise.all([
    searchPlaces(query, {
      page,
      pageSize: 24,
      category,
      openNow,
      clientKey,
    }),
    getCategoryCounts(),
    getSearchSuggestions(5),
  ]);

  const placeCount = categories.reduce((sum, item) => sum + item.count, 0);

  const { places, intent, totalCount, totalPages } = searchResult;

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
              ? `${totalCount} ${totalCount === 1 ? "place" : "places"} found`
              : `Browse ${placeCount.toLocaleString("en-US")} places across ${describeCategories(
                  categories.map((item) => item.name),
                )}, or describe what you're after.`}
          </p>
        </div>

        <div className="my-10">
          <SearchBar
            initialQuery={query}
            placeholder={
              suggestions[0] ? `Try “${suggestions[0]}”` : undefined
            }
          />
          {!query && <SearchSuggestions suggestions={suggestions} />}
        </div>

        {query && intent && <SearchUnderstanding intent={intent} />}

        <ExploreResults
          places={places}
          intent={intent}
          categories={categories}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}
