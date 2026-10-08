import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/shared/navbar";
import { PlaceCard } from "@/components/shared/place-card";
import { collections } from "@/lib/collections";
import { places } from "@/lib/places";

type CollectionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  const collection = collections.find((item) => item.id === id);

  if (!collection) {
    notFound();
  }

  const collectionPlaces = places.filter((place) =>
    collection.placeIds.includes(place.id),
  );

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to collections
        </Link>

        <div className="mt-12">
          <p className="text-sm font-medium text-emerald-600">Collection</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {collection.name}
          </h1>

          <p className="mt-4 max-w-xl text-muted-foreground">
            {collection.description}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            {collectionPlaces.length}{" "}
            {collectionPlaces.length === 1 ? "place" : "places"}
          </p>
        </div>

        {collectionPlaces.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collectionPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center">
            <h2 className="font-semibold">No places yet</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Add places to this collection to see them here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
