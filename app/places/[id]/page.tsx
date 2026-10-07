import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star } from "lucide-react";

import { getPlaceById } from "@/lib/places";

type PlacePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = getPlaceById(id);

  if (!place) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            href="/"
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

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <article className="overflow-hidden rounded-3xl border bg-background">
          <div className="relative aspect-[16/8] overflow-hidden bg-muted">
            <Image
              src={place.image}
              alt={place.name}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
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

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-current text-foreground" />
                    {place.rating.toFixed(1)}
                  </span>

                  <span>·</span>
                  <span>{place.priceLevel}</span>
                  <span>·</span>

                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {place.distance}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
              >
                Save place
              </button>
            </div>

            <div className="mt-10 grid gap-8 border-t pt-8 sm:grid-cols-2">
              <div>
                <h2 className="font-semibold">About this place</h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {place.description}
                </p>
              </div>

              <div>
                <h2 className="font-semibold">Location</h2>

                <p className="mt-3 text-muted-foreground">{place.address}</p>

                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-emerald-600 hover:underline"
                >
                  View on map
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
