import { PlaceCard } from "@/components/shared/place-card";
import { places } from "@/lib/places";


export function NearbyPlaces() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Around you</p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Places you might like
          </h2>
        </div>

        <button
          type="button"
          className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          View all
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
