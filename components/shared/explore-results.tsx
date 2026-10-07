"use client";

import { useState } from "react";

import { Map } from "@/components/shared/map";
import { PlaceCard } from "@/components/shared/place-card";
import type { Place } from "@/types/place";

type ExploreResultsProps = {
  places: Place[];
};

export function ExploreResults({ places }: ExploreResultsProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Places</h2>

          {selectedPlaceId && (
            <span className="text-sm text-muted-foreground">
              Place selected
            </span>
          )}
        </div>

        {places.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelected={selectedPlaceId === place.id}
                onHover={() => setSelectedPlaceId(place.id)}
                onLeave={() => setSelectedPlaceId(null)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border p-10 text-center">
            <h2 className="font-semibold">No places found</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Try searching for something different.
            </p>
          </div>
        )}
      </section>

      <aside className="hidden lg:block">
        <div className="sticky top-6 h-[600px] overflow-hidden rounded-3xl border">
          <Map
            places={places}
            selectedPlaceId={selectedPlaceId}
            onPlaceHover={setSelectedPlaceId}
          />
        </div>
      </aside>
    </div>
  );
}
