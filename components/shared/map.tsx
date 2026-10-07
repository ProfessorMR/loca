"use client";

import { createPlacePopupContent } from "@/components/shared/map-place-popup";
import "@/components/shared/map-place-popup.css";

import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Place } from "@/types/place";

setWorkerUrl(
  new URL(
    "maplibre-gl/dist/maplibre-gl-worker.mjs",
    import.meta.url,
  ).toString(),
);

type MapProps = {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceHover: (placeId: string | null) => void;
};

export function Map({ places, selectedPlaceId, onPlaceHover }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());

  useEffect(() => {
    markers.current.forEach((marker, placeId) => {
      const element = marker.getElement();

      if (placeId === selectedPlaceId) {
        element.classList.add("ring-4", "ring-emerald-600/30");
      } else {
        element.classList.remove("ring-4", "ring-emerald-600/30");
      }
    });
  }, [selectedPlaceId]);

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [51.389, 35.6892],
      zoom: 11,
    });

    map.current.addControl(new NavigationControl(), "top-right");

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();

      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) {
      return;
    }

    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    places.forEach((place) => {
      const markerElement = document.createElement("button");

      markerElement.type = "button";
      markerElement.setAttribute("aria-label", place.name);
      markerElement.className =
        "flex size-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-xs font-bold text-white shadow-lg";
      markerElement.textContent = "L";
      markerElement.dataset.placeId = place.id;

      markerElement.addEventListener("mouseenter", () => {
        onPlaceHover(place.id);
      });

      markerElement.addEventListener("mouseenter", () => {
        onPlaceHover(place.id);
      });

      const popup = new Popup({
        offset: 24,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "320px",
        className: "loca-place-popup",
      }).setHTML(createPlacePopupContent(place));

      markerElement.addEventListener("mouseenter", () => {
        markerElement.classList.add("ring-4", "ring-emerald-600/30");
      });

      markerElement.addEventListener("mouseleave", () => {
        markerElement.classList.remove("ring-4", "ring-emerald-600/30");
      });

      const marker = new Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markerElement.addEventListener("click", () => {
        onPlaceHover(place.id);

        map.current?.flyTo({
          center: [place.longitude, place.latitude],
          zoom: 13,
          duration: 600,
        });
      });

      markerElement.addEventListener("mouseenter", () => {
        markerElement.classList.add("ring-4", "ring-emerald-600/30");
      });

      markerElement.addEventListener("mouseleave", () => {
        if (selectedPlaceId !== place.id) {
          markerElement.classList.remove("ring-4", "ring-emerald-600/30");
        }
      });

      markers.current.set(place.id, marker);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();
    };
  }, [places]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
