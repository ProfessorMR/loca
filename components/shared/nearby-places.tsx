import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PlaceCard } from "@/components/shared/place-card";
import { getFeaturedPlaces } from "@/lib/places";

export async function NearbyPlaces() {
  const places = await getFeaturedPlaces();

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="display text-3xl sm:text-4xl">Places worth a look</h2>

          <p className="mt-2 text-muted-foreground">
            Well-documented spots, with hours, address and what they serve.
          </p>
        </div>

        <Link
          href="/explore"
          className="group hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {places.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
