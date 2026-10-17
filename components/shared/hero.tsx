"use client";

import { useRouter } from "next/navigation";

import { SearchBar } from "@/components/shared/search-bar";

type HeroProps = {
  /**
   * Quick-search words. `undefined` means "still loading" (space is reserved),
   * an empty array means there is nothing to show.
   */
  popularSearches?: string[];
  subtitle?: string;
  placeholder?: string;
};

const defaultSubtitle =
  "Describe what you're after in your own words and discover places that match.";

export function Hero({
  popularSearches,
  subtitle = defaultSubtitle,
  placeholder,
}: HeroProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-20">
        <div className="w-full max-w-4xl">
          <p className="mb-6 text-sm font-medium tracking-wide text-emerald-600">
            DISCOVER DIFFERENTLY
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            Find places
            <br />
            you&apos;ll love.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subtitle}
          </p>

          {/* Search */}
          <div className="mt-10 max-w-2xl">
            <SearchBar placeholder={placeholder} />

            {popularSearches === undefined && (
              <div aria-hidden="true" className="mt-5 h-8" />
            )}

            {popularSearches && popularSearches.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-muted-foreground">Try:</span>

                {popularSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() =>
                      router.push(`/explore?q=${encodeURIComponent(search)}`)
                    }
                    className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
