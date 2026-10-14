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

import { cn } from "@/lib/utils";

type CategoryStyle = {
  gradient: string;
  Icon: LucideIcon;
};

const categoryStyles: Record<string, CategoryStyle> = {
  Restaurant: {
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    Icon: Utensils,
  },
  "Fast Food": {
    gradient: "from-rose-500 via-red-500 to-orange-500",
    Icon: Utensils,
  },
  Cafe: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    Icon: Coffee,
  },
  Bar: {
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    Icon: Martini,
  },
  Hotel: {
    gradient: "from-sky-500 via-blue-600 to-indigo-600",
    Icon: Hotel,
  },
  Park: {
    gradient: "from-green-500 via-emerald-500 to-teal-600",
    Icon: TreePine,
  },
};

const fallbackStyle: CategoryStyle = {
  gradient: "from-slate-500 via-slate-600 to-slate-800",
  Icon: Store,
};

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
  if (image) {
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

  const style = categoryStyles[category] ?? fallbackStyle;
  const Icon = style.Icon;

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br text-white",
        style.gradient,
        className,
      )}
    >
      <Icon className="size-8 opacity-90" aria-hidden="true" />

      {showLabel && (
        <span className="text-xs font-medium opacity-90">{category}</span>
      )}
    </div>
  );
}
