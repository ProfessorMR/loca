import Link from "next/link";
import { ArrowLeft, MapPin, Star } from "lucide-react";

export default function PlacePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div className="overflow-hidden rounded-3xl border">
          <div className="aspect-[16/8] bg-muted" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Restaurant
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  The Green Table
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-current text-foreground" />
                    4.8
                  </span>

                  <span>·</span>

                  <span>$$</span>

                  <span>·</span>

                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    1.2 km
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
              >
                Save place
              </button>
            </div>

            <div className="mt-10 grid gap-8 border-t pt-8 sm:grid-cols-2">
              <div>
                <h2 className="font-semibold">About this place</h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  A cozy neighborhood restaurant with a relaxed atmosphere,
                  great food, and a comfortable setting for a casual dinner.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">Location</h2>

                <p className="mt-3 text-muted-foreground">123 Main Street</p>

                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-emerald-600 hover:underline"
                >
                  View on map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
