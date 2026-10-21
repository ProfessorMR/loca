import { getCategoryColor } from "@/lib/category-colors";
import { getInitials } from "@/lib/initials";

type PlaceBulletProps = {
  name: string;
  category: string;
  /** Tailwind size classes, e.g. "size-11" */
  className?: string;
  /** Font size of the initials; defaults to a size that suits "size-11" */
  fontSize?: string;
};

/**
 * A place's mark: a filled circle in its category's color with its initials,
 * like the bullets that name the lines on a subway map.
 */
export function PlaceBullet({
  name,
  category,
  className = "size-11",
  fontSize,
}: PlaceBulletProps) {
  const initials = getInitials(name);

  return (
    <span
      aria-hidden="true"
      className={`${className} display flex shrink-0 select-none items-center justify-center rounded-full text-white`}
      style={{
        backgroundColor: getCategoryColor(category),
        fontSize: fontSize ?? (initials.length > 1 ? "0.95rem" : "1.1rem"),
        letterSpacing: "-0.01em",
      }}
    >
      {initials || "•"}
    </span>
  );
}
