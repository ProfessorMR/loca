"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export function SavePlaceButton() {
  const [saved, setSaved] = useState(false);

  function handleClick() {
    setSaved((current) => !current);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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
