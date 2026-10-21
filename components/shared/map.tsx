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
import { useRouter } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";

import { getCategoryHue } from "@/lib/category-colors";
import type { Place } from "@/types/place";

setWorkerUrl(
  new URL(
    "maplibre-gl/dist/maplibre-gl-worker.mjs",
    import.meta.url,
  ).toString(),
);

const MAX_MAP_MARKERS = 150;

type MapProps = {
  places: Place[];
  selectedPlaceId: string | null;
  /** A marker is hovered (null when the popup closes): highlights its card */
  onPlaceHover: (placeId: string | null) => void;
  /** A marker was clicked: the list can scroll to its card */
  onPlaceClick?: (placeId: string) => void;
};

export function Map({
  places,
  selectedPlaceId,
  onPlaceHover,
  onPlaceClick,
}: MapProps) {
  const router = useRouter();

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());

  const callbacks = useRef({
    onPlaceHover,
    onPlaceClick,
    selectedPlaceId,
    push: (url: string) => router.push(url),
  });

  // Keep the latest values for the marker handlers, after each render.
  useEffect(() => {
    callbacks.current = {
      onPlaceHover,
      onPlaceClick,
      selectedPlaceId,
      push: (url: string) => router.push(url),
    };
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) {
      return;
    }

    const instance = new MapLibreMap({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [-73.9857, 40.7484],
      zoom: 11,
    });

    map.current = instance;
    instance.addControl(new NavigationControl(), "top-right");

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();

      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    markers.current.forEach((marker, placeId) => {
      const element = marker.getElement();

      if (placeId === selectedPlaceId) {
        element.classList.add("ring-4", "ring-signal");
      } else {
        element.classList.remove("ring-4", "ring-signal");
      }
    });
  }, [selectedPlaceId]);

  useEffect(() => {
    const instance = map.current;

    if (!instance) {
      return;
    }

    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();

    const mapPlaces = places.slice(0, MAX_MAP_MARKERS);

    mapPlaces.forEach((place) => {
      // A small dot in the category's color (the same colors as the cards).
      const markerElement = document.createElement("button");

      markerElement.type = "button";
      markerElement.setAttribute("aria-label", place.name);
      markerElement.className =
        "flex size-7 items-center justify-center rounded-full border-2 border-white shadow-lg";
      markerElement.style.backgroundColor = `hsl(${getCategoryHue(place.category)} 55% 42%)`;
      markerElement.dataset.placeId = place.id;

      const dot = document.createElement("span");
      dot.className = "size-2 rounded-full bg-white/90";
      markerElement.append(dot);

      const popup = new Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "260px",
        className: "loca-place-popup",
      });

      // Built when it opens, so "Open now" is always up to date.
      popup.on("open", () => {
        popup.setHTML(createPlacePopupContent(place));

        const element = popup.getElement();

        // "View place" navigates inside the app instead of reloading the page.
        if (element && !element.dataset.linkBound) {
          element.dataset.linkBound = "true";

          element.addEventListener("click", (event) => {
            const link = (
              event.target as HTMLElement
            ).closest<HTMLAnchorElement>("a[data-place-link]");

            if (
              !link ||
              event.defaultPrevented ||
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey
            ) {
              return;
            }

            event.preventDefault();
            callbacks.current.push(link.getAttribute("href") ?? "/explore");
          });
        }
      });

      popup.on("close", () => {
        callbacks.current.onPlaceHover(null);
      });

      markerElement.addEventListener("mouseenter", () => {
        callbacks.current.onPlaceHover(place.id);
        markerElement.classList.add("ring-4", "ring-signal");
      });

      markerElement.addEventListener("mouseleave", () => {
        if (callbacks.current.selectedPlaceId !== place.id) {
          markerElement.classList.remove("ring-4", "ring-signal");
        }
      });

      markerElement.addEventListener("click", () => {
        callbacks.current.onPlaceHover(place.id);
        callbacks.current.onPlaceClick?.(place.id);

        // Put the marker a little below the middle so the card opens fully
        // inside the map instead of being cut off at the top.
        instance.easeTo({
          center: [place.longitude, place.latitude],
          zoom: Math.max(instance.getZoom(), 13),
          offset: [0, 110],
          duration: 400,
        });
      });

      const marker = new Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(instance);

      markers.current.set(place.id, marker);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current.clear();
    };
  }, [places]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
