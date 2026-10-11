import Link from "next/link";
import Image from "next/image";

import { ArrowLeft, MapPin, Navigation, Star } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { PlaceLocationMap } from "@/components/shared/place-location-map";
import { SavePlaceButton } from "@/components/shared/save-place-button";
import { getPlaceById } from "@/lib/places";
import { ViewOnMapButton } from "@/components/shared/view-on-map-button";

type PlacePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          <div className="mt-10 rounded-3xl border p-8 text-center">
            <h1 className="text-2xl font-semibold">Place not found</h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t find the place you&apos;re looking for.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const metaItems = [place.priceLevel, place.distance, place.address].filter(
    (item): item is string => Boolean(item),
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <article className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="relative aspect-[16/7] overflow-hidden bg-muted">
            {place.image ? (
              <Image
                src={place.image}
                alt={place.name}
                fill
                sizes="(min-width: 1024px) 1152px, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}

            {place.image && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
            )}

            <div className="absolute bottom-5 left-5">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                {place.category}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  {place.category}
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {place.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                  {place.rating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="size-4 fill-current text-foreground" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}

                  {metaItems.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="flex items-center gap-1"
                    >
                      {index > 0 && <span className="mr-3">·</span>}
                      {item === place.address && <MapPin className="size-4" />}
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <SavePlaceButton placeId={place.id} />
            </div>

            <div className="mt-10 grid gap-8 border-t pt-8 sm:grid-cols-2">
              <div>
                <h2 className="font-semibold">About this place</h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {place.description || "No description available yet."}
                </p>
              </div>

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">Location</h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {place.address || "Address unavailable"}
                    </p>
                  </div>

                  <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                </div>

                <ViewOnMapButton />

                <div
                  id="place-location-map"
                  className="mt-5 h-72 overflow-hidden rounded-2xl border"
                >
                  <PlaceLocationMap place={place} />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
