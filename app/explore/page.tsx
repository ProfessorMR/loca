import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExplorePage() {
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
            Find your next place.
          </h1>

          <p className="mt-4 max-w-xl text-muted-foreground">
            Search for places based on what you&apos;re looking for.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border p-2 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
            />

            <button
              type="button"
              className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
