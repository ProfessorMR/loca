"use client";

import Link from "next/link";
import { Bookmark, Star } from "lucide-react";

import { useFavorites } from "@/components/shared/favorites-provider";
import { OpenStatus } from "@/components/shared/open-status";
import { PlaceBullet } from "@/components/shared/place-bullet";
import { PlaceImage } from "@/components/shared/place-image";
import { getCategoryLabel } from "@/lib/category-labels";
import { formatStreetAddress } from "@/lib/format-address";
import { formatTag, isFeatureTag } from "@/lib/osm-tags";
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
  const streetAddress = formatStreetAddress(place.address);

  const cuisines = place.tags.filter((tag) => !isFeatureTag(tag));

  // Tags the search asked for come first (highlighted), then what the place
  // serves, then other facts. Three at most.
  const requested = new Set([
    ...(intent?.cuisines ?? []),
    ...(intent?.features ?? []),
  ]);
  const matchedTags = hasSearch
    ? place.tags.filter((tag) => requested.has(tag))
    : [];
  const chips = Array.from(
    new Set([
      ...matchedTags,
      ...cuisines.slice(0, 2),
      ...place.tags.filter(isFeatureTag),
    ]),
  ).slice(0, 3);

  const kind = [
    getCategoryLabel(place.category).replace(/s$/, ""),
    ...(cuisines[0] ? [formatTag(cuisines[0])] : []),
  ].join(" · ");

  return (
    <Link
      href={`/places/${place.id}`}
      onMouseEnter={onHover}
      onClick={onClick}
      className={`group relative block h-full overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[0_14px_30px_-18px_rgba(19,32,58,0.35)] ${
        isSelected
          ? "border-foreground shadow-[0_14px_30px_-18px_rgba(19,32,58,0.35)] ring-1 ring-foreground"
          : "border-border"
      }`}
    >
      <article>
        {place.image && (
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <PlaceImage
              image={place.image}
              name={place.name}
              category={place.category}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              priority={isPriority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <PlaceBullet name={place.name} category={place.category} />

            <div className="min-w-0 flex-1 pr-11">
              <h3 className="line-clamp-2 text-[1.05rem] font-bold leading-snug tracking-tight">
                {place.name}
              </h3>

              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {kind}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFavorite(place.id);
            }}
            aria-label={saved ? "Remove from saved places" : "Save place"}
            aria-pressed={saved}
            className={`absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border transition-colors ${
              saved
                ? "border-foreground bg-foreground text-background"
                : "bg-card text-foreground hover:border-foreground"
            }`}
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
          </button>

          {(place.openingHours || streetAddress || place.distance) && (
            <div className="mt-4 space-y-1.5 empty:hidden">
              <OpenStatus openingHours={place.openingHours} />

              {(streetAddress || place.distance) && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  {streetAddress && (
                    <span className="truncate">{streetAddress}</span>
                  )}

                  {place.distance && (
                    <span className="tabular shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                      {place.distance}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chips.map((tag) => {
                const isMatch = matchedTags.includes(tag);

                return (
                  <span
                    key={tag}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      isMatch
                        ? "bg-signal text-signal-foreground"
                        : "bg-secondary text-foreground/80"
                    }`}
                  >
                    {formatTag(tag)}
                  </span>
                );
              })}
            </div>
          )}

          {place.rating !== null && (
            <div className="mt-3 flex items-center gap-1 text-sm font-medium">
              <Star className="size-4 fill-current" />
              {place.rating.toFixed(1)}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
