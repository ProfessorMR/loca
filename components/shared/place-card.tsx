"use client";

import Link from "next/link";
import { Bookmark, MapPin, Star } from "lucide-react";
import { useFavorites } from "@/components/shared/favorites-provider";
import { PlaceImage } from "@/components/shared/place-image";
import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type PlaceCardProps = {
  place: Place;
  isSelected?: boolean;
  onHover?: () => void;
  onClick?: () => void;
  isPriority?: boolean;
  intent?: SearchIntent;
};

const tagLabels: Record<string, string> = {
  quiet: "Quiet",
  "work-friendly": "Work-friendly",
  cozy: "Cozy",
  relaxing: "Relaxing",
  casual: "Casual",
  nature: "Nature",
  outdoor: "Outdoor",
  dinner: "Dinner",
  coffee: "Coffee",
  food: "Food",
  date: "Date-friendly",
};

export function PlaceCard({
  place,
  isSelected = false,
  onHover,
  onClick,
  isPriority = false,
  intent,
}: PlaceCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(place.id);

  const hasSearch = Boolean(intent?.query.trim());

  const reasonTags = place.tags
    .filter((tag) => {
      if (!tagLabels[tag]) return false;
      if (!hasSearch) return true;

      return intent?.tags.includes(tag) ?? false;
    })
    .slice(0, 3);

  const matchesPrice =
    hasSearch &&
    Boolean(intent?.priceLevel) &&
    place.priceLevel === intent?.priceLevel;

  return (
    <Link
      href={`/places/${place.id}`}
      onMouseEnter={onHover}
      onClick={onClick}
      className={`group block overflow-hidden rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isSelected ? "border-emerald-600 shadow-md" : "border-border"
      }`}
    >
      <article>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <PlaceImage
              image={place.image}
              name={place.name}
              category={place.category}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              priority={isPriority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />


          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFavorite(place.id);
            }}
            aria-label={saved ? "Remove from saved places" : "Save place"}
            aria-pressed={saved}
            className={`absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              saved
                ? "bg-foreground text-background"
                : "bg-background/90 text-foreground hover:bg-background"
            }`}
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
          </button>

          <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            {place.category}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold tracking-tight">
                {place.name}
              </h3>
            </div>

            {place.rating !== null && (
              <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
                <Star className="size-4 fill-current" />
                {place.rating.toFixed(1)}
              </div>
            )}
          </div>

          {(place.priceLevel || place.distance) && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              {place.priceLevel && <span>{place.priceLevel}</span>}

              {place.priceLevel && place.distance && <span>·</span>}

              {place.distance && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {place.distance}
                </span>
              )}
            </div>
          )}

          {(reasonTags.length > 0 || matchesPrice) && (
            <div className="mt-4 border-t pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {hasSearch ? "Why this matches" : "Features"}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {reasonTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    {tagLabels[tag]}
                  </span>
                ))}

                {matchesPrice && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Budget match
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
