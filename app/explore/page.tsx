import { Suspense } from "react";

import { ExploreContent } from "./explore-content";

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    sort?: string;
    price?: string;
  }>;
};

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-12 h-12 max-w-xl animate-pulse rounded bg-muted" />
            <div className="mt-4 h-5 max-w-md animate-pulse rounded bg-muted" />

            <div className="my-10 h-12 animate-pulse rounded-xl bg-muted" />

            <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="h-96 animate-pulse rounded-2xl bg-muted" />
              <div className="hidden h-[600px] animate-pulse rounded-3xl bg-muted lg:block" />
            </div>
          </div>
        </main>
      }
    >
      <ExploreContent searchParams={searchParams} />
    </Suspense>
  );
}
