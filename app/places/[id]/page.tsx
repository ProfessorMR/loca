import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";

import { HoursTable } from "@/components/shared/hours-table";
import { Navbar } from "@/components/shared/navbar";
import { OpenStatus } from "@/components/shared/open-status";
import { PlaceBullet } from "@/components/shared/place-bullet";
import { PlaceImage } from "@/components/shared/place-image";
import { PlaceLocationMap } from "@/components/shared/place-location-map";
import { SavePlaceButton } from "@/components/shared/save-place-button";
import { getCategoryColor } from "@/lib/category-colors";
import { getCategoryLabel } from "@/lib/category-labels";
import { directionsUrl, safePhone, safeWebsite } from "@/lib/contact";
import { formatTag, isFeatureTag } from "@/lib/osm-tags";
import { getPlaceById } from "@/lib/places";

type PlacePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const card = "rounded-2xl border bg-card p-6";
const cardTitle = "flex items-center gap-2.5 text-lg font-bold tracking-tight";

const actionClass =
  "inline-flex h-11 items-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold transition-colors hover:border-foreground";

// What the visitor sees while the place loads: the same shape as the page.
function PlaceSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-6"
      aria-busy="true"
      aria-label="Loading place"
    >
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />

      <div className="mt-8 flex items-start gap-5">
        <div className="size-16 shrink-0 animate-pulse rounded-full bg-muted sm:size-20" />

        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-10 w-3/4 max-w-md animate-pulse rounded bg-muted" />
          <div className="mt-4 h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-7 flex gap-2.5">
        <div className="h-11 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-11 w-36 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

// The page itself has no data. Everything that reads the database is inside
// <Suspense>, so Next can show the menu and this skeleton immediately.
export default function PlacePage({ params }: PlacePageProps) {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Suspense fallback={<PlaceSkeleton />}>
        <PlaceContent params={params} />
      </Suspense>
    </main>
  );
}

async function PlaceContent({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) notFound();

  const cuisines = place.tags.filter((tag) => !isFeatureTag(tag));
  const features = place.tags.filter(isFeatureTag);

  const website = safeWebsite(place.website);
  const phone = safePhone(place.phone);

  const kind = [
    getCategoryLabel(place.category).replace(/s$/, ""),
    ...cuisines.slice(0, 3).map(formatTag),
  ].join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-6">
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to explore
      </Link>

      {place.image && (
        <div className="relative mt-5 aspect-[21/9] overflow-hidden rounded-3xl bg-muted">
          <PlaceImage
            image={place.image}
            name={place.name}
            category={place.category}
            sizes="(min-width: 1152px) 1152px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <header className="mt-8 flex items-start gap-5">
        <PlaceBullet
          name={place.name}
          category={place.category}
          className="size-16 sm:size-20"
          fontSize="1.5rem"
        />

        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(place.category) }}
            />
            {kind}
          </p>

          <h1 className="display mt-1.5 text-4xl sm:text-5xl">{place.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <OpenStatus
              openingHours={place.openingHours}
              className="text-base"
            />

            {place.address && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {place.address}
              </span>
            )}

            {place.rating !== null && (
              <span className="flex items-center gap-1 font-medium">
                <Star className="size-4 fill-current" />
                {place.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <SavePlaceButton placeId={place.id} />

        <a
          href={directionsUrl(place.latitude, place.longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          <Navigation className="size-4" />
          Directions
        </a>

        {website && (
          <a
            href={website.href}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            <Globe className="size-4" />
            {website.label}
          </a>
        )}

        {phone && (
          <a href={phone.href} className={actionClass}>
            <Phone className="size-4" />
            {phone.label}
          </a>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          {place.description && (
            <section className={card}>
              <h2 className={cardTitle}>About</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {place.description}
              </p>
            </section>
          )}

          <section className={card}>
            <h2 className={cardTitle}>
              <Clock className="size-5" />
              Opening hours
            </h2>

            <div className="mt-4">
              {place.openingHours ? (
                <HoursTable openingHours={place.openingHours} />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No opening hours are listed for this place yet.
                </p>
              )}
            </div>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>
              <Check className="size-5" />
              Good to know
            </h2>

            {cuisines.length > 0 || features.length > 0 ? (
              <div className="mt-4 space-y-5">
                {cuisines.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serves</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {cuisines.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium"
                        >
                          {formatTag(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {features.length > 0 && (
                  <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {features.map((tag) => (
                      <li
                        key={tag}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-open text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {formatTag(tag)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nothing listed yet.
              </p>
            )}

            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              These details come from OpenStreetMap volunteers. A place may
              offer more than what is listed here.
            </p>
          </section>
        </div>

        <aside>
          <div className="space-y-4 lg:sticky lg:top-24">
            <div
              id="place-location-map"
              className="h-72 overflow-hidden rounded-2xl border bg-card lg:h-80"
            >
              <PlaceLocationMap place={place} />
            </div>

            <div className={card}>
              <h2 className={cardTitle}>
                <MapPin className="size-5" />
                Address
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {place.address || "Address unavailable"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
