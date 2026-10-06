import { MapPin, Star } from "lucide-react";

const places = [
  {
    name: "The Green Table",
    category: "Restaurant",
    rating: "4.8",
    price: "$$",
    distance: "1.2 km",
  },
  {
    name: "Morning Roast",
    category: "Cafe",
    rating: "4.7",
    price: "$$",
    distance: "0.8 km",
  },
  {
    name: "Oak Garden",
    category: "Park",
    rating: "4.6",
    price: "Free",
    distance: "2.0 km",
  },
];

export function NearbyPlaces() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Around you
          </p>

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
          <article
            key={place.name}
            className="group overflow-hidden rounded-2xl border bg-background transition-shadow hover:shadow-md"
          >
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-muted" />

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold tracking-tight">
                    {place.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {place.category}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="size-4 fill-current" />
                  {place.rating}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{place.price}</span>

                <span>·</span>

                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {place.distance}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}