"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";

import { Navbar } from "@/components/shared/navbar";
import { PlaceCard } from "@/components/shared/place-card";
import { useFavorites } from "@/components/shared/favorites-provider";
import type { Place } from "@/types/place";

type LoadedPlaces = {
  /** Which list of ids these places belong to */
  key: string;
  places: Place[];
  failed: boolean;
};

export default function SavedPage() {
  const { favoritePlaceIds, isReady } = useFavorites();

  // Newest saved first.
  const orderedIds = [...favoritePlaceIds].reverse();
  const idsKey = orderedIds.join(",");

  const [loaded, setLoaded] = useState<LoadedPlaces | null>(null);

  useEffect(() => {
    if (idsKey === "") return;

    let isActive = true;

    fetch(`/api/places?ids=${encodeURIComponent(idsKey)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch places");
        return response.json() as Promise<{ places: Place[] }>;
      })
      .then((data) => {
        if (isActive) {
          setLoaded({ key: idsKey, places: data.places, failed: false });
        }
      })
      .catch((error) => {
        console.error("Failed to load saved places:", error);

        if (isActive) {
          setLoaded({ key: idsKey, places: [], failed: true });
        }
      });

    return () => {
      isActive = false;
    };
  }, [idsKey]);

  const isCurrent = loaded?.key === idsKey;
  const isLoading = !isReady || (idsKey !== "" && !isCurrent);
  const hasError = isCurrent && loaded.failed;
  const savedPlaces = idsKey !== "" && isCurrent ? loaded.places : [];

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to explore
        </Link>

        <div className="mt-12">
          <p className="text-sm font-medium text-emerald-600">Your places</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Saved places
          </h1>

          <p className="mt-4 text-muted-foreground">
            Places you want to come back to. They are kept in this browser.
          </p>
        </div>

        {isLoading ? (
          <div
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading saved places"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl bg-muted"
              />
            ))}
          </div>
        ) : hasError ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center">
            <h2 className="font-semibold">
              Couldn&apos;t load your saved places
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            >
              Try again
            </button>
          </div>
        ) : savedPlaces.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Bookmark className="size-5 text-muted-foreground" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">No saved places yet</h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Save places you like and they&apos;ll appear here.
            </p>

            <Link
              href="/explore"
              className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Explore places
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
