import { connection } from "next/server";

import { ExploreResults } from "@/components/shared/explore-results";
import { headers } from "next/headers";

import {
  ExploreNavigationProvider,
  PendingFade,
} from "@/components/shared/explore-navigation";
import { Navbar } from "@/components/shared/navbar";
import { SearchBar } from "@/components/shared/search-bar";
import { SearchUnderstanding } from "@/components/shared/search-understanding";
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

  const { places, intent, totalCount, totalPages } = searchResult;

  return (
    <main className="min-h-screen">
      <Navbar />

      <ExploreNavigationProvider>
        <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-6">
          <SearchBar
            key={query}
            initialQuery={query}
            placeholder={
              suggestions[0] ? `Try “${suggestions[0]}”` : "Describe the place you want"
            }
          />

          {!query && <SearchSuggestions suggestions={suggestions} />}

          {query && intent && (
            <PendingFade className="mt-4">
              <SearchUnderstanding intent={intent} />
            </PendingFade>
          )}

          <ExploreResults
            places={places}
            intent={intent}
            categories={categories}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </ExploreNavigationProvider>
    </main>
  );
}
