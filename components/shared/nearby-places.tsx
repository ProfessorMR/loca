import { PlaceCard } from "@/components/shared/place-card";
import type { Place } from "@/types/place";

const places: Place[] = [
  {
    id: "1",
    name: "The Green Table",
    category: "Restaurant",
    rating: 4.8,
    priceLevel: "$$",
    distance: "1.2 km",
    image: "/places/restaurant.webp",
  },
  {
    id: "2",
    name: "Morning Roast",
    category: "Cafe",
    rating: 4.7,
    priceLevel: "$$",
    distance: "0.8 km",
    image: "/places/cafe.jpg",
  },
  {
    id: "3",
    name: "Oak Garden",
    category: "Park",
    rating: 4.6,
    priceLevel: "Free",
    distance: "2.0 km",
    image: "/places/park.jpg",
  },
];

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
