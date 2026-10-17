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

const MAX_MAP_MARKERS = 150;

type MapProps = {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceHover: (placeId: string | null) => void;
};

export function Map({ places, selectedPlaceId, onPlaceHover }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());

  const callbacks = useRef({
    onPlaceHover,
    selectedPlaceId,
  });

  // Keep the latest values for the marker handlers, after each render.
  useEffect(() => {
    callbacks.current = {
      onPlaceHover,
      selectedPlaceId,
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
        element.classList.add("ring-4", "ring-emerald-600/30");
      } else {
        element.classList.remove("ring-4", "ring-emerald-600/30");
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
      const markerElement = document.createElement("button");

      markerElement.type = "button";
      markerElement.setAttribute("aria-label", place.name);
      markerElement.className =
        "flex size-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-xs font-bold text-white shadow-lg";
      markerElement.textContent = "L";
      markerElement.dataset.placeId = place.id;

      const popup = new Popup({
        offset: 24,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "320px",
        className: "loca-place-popup",
      }).setHTML(createPlacePopupContent(place));

      popup.on("close", () => {
        callbacks.current.onPlaceHover(null);
      });

      markerElement.addEventListener("mouseenter", () => {
        callbacks.current.onPlaceHover(place.id);
        markerElement.classList.add("ring-4", "ring-emerald-600/30");
      });

      markerElement.addEventListener("mouseleave", () => {
        if (callbacks.current.selectedPlaceId !== place.id) {
          markerElement.classList.remove("ring-4", "ring-emerald-600/30");
        }
      });

      markerElement.addEventListener("click", () => {
        callbacks.current.onPlaceHover(place.id);
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

  useEffect(() => {
    const instance = map.current;

    if (!instance || !selectedPlaceId) {
      return;
    }

    const selectedPlace = places.find((place) => place.id === selectedPlaceId);

    if (!selectedPlace) {
      return;
    }

    instance.flyTo({
      center: [selectedPlace.longitude, selectedPlace.latitude],
      zoom: 13,
      duration: 500,
    });
  }, [places, selectedPlaceId]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
