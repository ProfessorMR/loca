"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";

import { Navbar } from "@/components/shared/navbar";
import { PlaceCard } from "@/components/shared/place-card";
import { useFavorites } from "@/components/shared/favorites-provider";
import { places } from "@/lib/places";

export default function SavedPage() {
  const { favoritePlaceIds } = useFavorites();

  const savedPlaces = places.filter((place) =>
    favoritePlaceIds.includes(place.id),
  );

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
            Places you want to come back to.
          </p>
        </div>

        {savedPlaces.length > 0 ? (
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
