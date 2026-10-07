"use client";

import { Map } from "@/components/shared/map";
import type { Place } from "@/types/place";

type PlaceLocationMapProps = {
  place: Place;
};

export function PlaceLocationMap({ place }: PlaceLocationMapProps) {
  return (
    <div className="h-72 overflow-hidden rounded-2xl border">
      <Map
        places={[place]}
        selectedPlaceId={place.id}
        onPlaceHover={() => {}}
      />
    </div>
  );
}
