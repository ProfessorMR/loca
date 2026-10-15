import Link from "next/link";

import { PlaceCard } from "@/components/shared/place-card";
import { getFeaturedPlaces } from "@/lib/places";

export async function NearbyPlaces() {
  const places = await getFeaturedPlaces();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Featured</p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Places worth a look
          </h2>
        </div>

        <Link
          href="/explore"
          className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          View all
        </Link>
      </div>

      {places.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <h3 className="font-semibold">No places available yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Places will appear here once they are added to the database.
          </p>
        </div>
      )}
    </section>
  );
}
