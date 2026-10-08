"use client";

import { Bookmark } from "lucide-react";

import { useFavorites } from "@/components/shared/favorites-provider";

type SavePlaceButtonProps = {
  placeId: string;
};

export function SavePlaceButton({ placeId }: SavePlaceButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const saved = isFavorite(placeId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(placeId)}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
        saved
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:border-foreground/30"
      }`}
    >
      <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />

      {saved ? "Saved" : "Save place"}
    </button>
  );
}
