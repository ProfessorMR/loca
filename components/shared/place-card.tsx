import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import type { Place } from "@/types/place";

import Link from "next/link";

type PlaceCardProps = {
  place: Place;
};

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link
      href={`/places/${place.id}`}
      className="group block overflow-hidden rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <article className="group overflow-hidden rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={place.image}
            alt={place.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            {place.category}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold tracking-tight">
                {place.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {place.category}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="size-4 fill-current" />
              {place.rating.toFixed(1)}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{place.priceLevel}</span>

            <span>·</span>

            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {place.distance}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
