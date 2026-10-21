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
      className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors ${
        saved
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:border-foreground"
      }`}
    >
      <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />

      {saved ? "Saved" : "Save"}
    </button>
  );
}
