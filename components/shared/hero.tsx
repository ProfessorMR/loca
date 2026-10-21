import Link from "next/link";

import { SearchBar } from "@/components/shared/search-bar";

type HeroProps = {
  /**
   * Example searches. `undefined` means "still loading" (space is reserved),
   * an empty array means there is nothing to show.
   */
  popularSearches?: string[];
  subtitle?: string;
  placeholder?: string;
};

const defaultSubtitle =
  "Say what you're after in your own words and discover places that match.";

export function Hero({
  popularSearches,
  subtitle = defaultSubtitle,
  placeholder,
}: HeroProps) {
  return (
    <div>
      <h1 className="display text-[2.75rem] sm:text-6xl xl:text-7xl">
        Describe
        <br />
        the place.
        <br />
        <span className="relative isolate inline-block whitespace-nowrap">
          <span
            aria-hidden="true"
            className="absolute inset-x-[-0.08em] bottom-[0.06em] -z-10 h-[0.36em] bg-signal"
          />
          We&apos;ll find it.
        </span>
      </h1>

      <p className="mt-6 max-w-md text-lg leading-7 text-muted-foreground">
        {subtitle}
      </p>

      <div className="mt-8 max-w-xl">
        <SearchBar placeholder={placeholder} />

        {popularSearches === undefined && (
          <div aria-hidden="true" className="mt-5 h-16" />
        )}

        {popularSearches && popularSearches.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">Try</span>

            {popularSearches.map((search) => (
              <Link
                key={search}
                href={`/explore?q=${encodeURIComponent(search)}`}
                className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                {search}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
