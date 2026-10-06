import { ArrowUpRight, Search } from "lucide-react";

const popularSearches = [
  "Coffee",
  "Dinner",
  "Date night",
  "Work-friendly",
];

export function Hero() {
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
            Tell us what you&apos;re looking for and discover places that
            actually match your mood, needs, and plans.
          </p>

          {/* Search */}
          <div className="mt-10 max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md">
              <Search
                className="ml-3 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                type="text"
                placeholder="What are you looking for?"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
              />

              <button
                type="button"
                className="group flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-[1.03]"
                aria-label="Search"
              >
                <ArrowUpRight
                  className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-muted-foreground">
                Try:
              </span>

              {popularSearches.map((search) => (
                <button
                  key={search}
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}