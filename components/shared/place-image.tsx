import Image from "next/image";
import {
  Coffee,
  Hotel,
  Martini,
  Store,
  TreePine,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { CATEGORY_HUES } from "@/lib/category-colors";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";

/**
 * Fallback design for places without a photo.
 *
 * Each category has a base hue. Each place nudges that hue, lightness and
 * pattern using a hash of its name, so a grid of photo-less cards looks varied
 * but stays stable between renders (no hydration mismatch, no flicker).
 * Colors are inline HSL so Tailwind never purges them.
 */

type CategoryStyle = {
  hue: number;
  Icon: LucideIcon;
};

const categoryStyles: Record<string, CategoryStyle> = {
  Restaurant: { hue: CATEGORY_HUES.Restaurant, Icon: Utensils },
  "Fast Food": { hue: CATEGORY_HUES["Fast Food"], Icon: Utensils },
  Cafe: { hue: CATEGORY_HUES.Cafe, Icon: Coffee },
  Bar: { hue: CATEGORY_HUES.Bar, Icon: Martini },
  Hotel: { hue: CATEGORY_HUES.Hotel, Icon: Hotel },
  Park: { hue: CATEGORY_HUES.Park, Icon: TreePine },
};

const fallbackStyle: CategoryStyle = { hue: 220, Icon: Store };

// Simple, fast string hash (FNV-1a). Deterministic across server and client.
function hashString(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

// Four subtle texture overlays, picked per place.
const patterns: string[] = [
  // dots
  "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.6px)",
  // diagonal stripes
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 14px)",
  // grid
  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
  // rings
  "repeating-radial-gradient(circle at 15% 120%, rgba(255,255,255,0.09) 0 2px, transparent 2px 20px)",
];

const patternSizes: (string | undefined)[] = [
  "18px 18px",
  undefined,
  "22px 22px",
  undefined,
];

function buildFallbackSurface(
  name: string,
  baseHue: number,
): { style: CSSProperties; patternIndex: number } {
  const hash = hashString(name);

  const hue = (baseHue + ((hash % 29) - 14) + 360) % 360;
  const saturation = 38 + (hash % 11); // 38–48%
  const lightness = 29 + ((hash >> 4) % 8); // 29–36%, keeps white text readable
  const patternIndex = (hash >> 8) % patterns.length;

  return {
    patternIndex,
    style: {
      backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
      backgroundImage: patterns[patternIndex],
      backgroundSize: patternSizes[patternIndex],
    },
  };
}

// Keep in sync with images.remotePatterns in next.config.ts. next/image throws
// for any other host, so such images fall back to the placeholder instead of
// crashing the page.
const ALLOWED_IMAGE_HOST = /(^|\.)wikimedia\.org$/i;

export function isLoadableImage(src: string): boolean {
  try {
    const url = new URL(src);

    return url.protocol === "https:" && ALLOWED_IMAGE_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

type PlaceImageProps = {
  image: string | null;
  name: string;
  category: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  showLabel?: boolean;
};

export function PlaceImage({
  image,
  name,
  category,
  sizes,
  priority = false,
  className,
  showLabel = false,
}: PlaceImageProps) {
  if (image && isLoadableImage(image)) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className={className}
      />
    );
  }

  const { hue, Icon } = categoryStyles[category] ?? fallbackStyle;
  const { style } = buildFallbackSurface(name, hue);
  const initials = getInitials(name);

  return (
    <div
      role="img"
      aria-label={name}
      style={style}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-white",
        className,
      )}
    >
      {/* Oversized category icon, cropped by the card edge */}
      <Icon
        className="pointer-events-none absolute -bottom-6 -right-6 size-36 opacity-[0.14]"
        strokeWidth={1.25}
        aria-hidden="true"
      />

      {initials ? (
        <span
          aria-hidden="true"
          className="relative text-5xl font-semibold leading-none tracking-tight text-white/95 drop-shadow-sm"
        >
          {initials}
        </span>
      ) : (
        <Icon className="relative size-10 opacity-90" aria-hidden="true" />
      )}

      {showLabel && (
        <span className="relative mt-3 text-xs font-medium text-white/80">
          {category}
        </span>
      )}
    </div>
  );
}
