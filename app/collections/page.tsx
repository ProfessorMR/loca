import Link from "next/link";
import { ArrowLeft, FolderHeart } from "lucide-react";

import { Navbar } from "@/components/shared/navbar";
import { collections } from "@/lib/collections";
import { getPlaces } from "@/lib/places";

export const instant = false;

export default async function CollectionsPage() {
  const places = await getPlaces();
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
          <p className="text-sm font-medium text-emerald-600">
            Your collections
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Places worth keeping.
          </h1>

          <p className="mt-4 max-w-xl text-muted-foreground">
            Organize the places you love into collections for later.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const collectionPlaces = places.filter((place) =>
              collection.placeIds.includes(place.id),
            );

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="group overflow-hidden rounded-3xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid aspect-[16/9] grid-cols-2 gap-1 bg-muted">
                  {collectionPlaces.slice(0, 2).map((place) => (
                    <div key={place.id} className="overflow-hidden bg-muted">
                      {place.image ? (
                        <img
                          src={place.image}
                          alt={place.name}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  ))}

                  {collectionPlaces.length === 1 && (
                    <div className="bg-muted" />
                  )}

                  {collectionPlaces.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center">
                      <FolderHeart className="size-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="font-semibold tracking-tight">
                    {collection.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {collection.description}
                  </p>

                  <p className="mt-4 text-xs font-medium text-muted-foreground">
                    {collectionPlaces.length}{" "}
                    {collectionPlaces.length === 1 ? "place" : "places"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
