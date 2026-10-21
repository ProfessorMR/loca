/**
 * The LOCA mark: a transit-style bullet (a filled circle with a letter), the
 * same shape used for places, so the whole app speaks one visual language.
 */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} display flex shrink-0 items-center justify-center rounded-full bg-foreground text-[0.95em] text-signal`}
      style={{ fontSize: "0.9rem", lineHeight: 1, fontWeight: 800 }}
    >
      L
    </span>
  );
}
