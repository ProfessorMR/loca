import type { ReactNode } from "react";

/** Text and search on the left, the city on the right (stacked on a phone). */
export function HeroLayout({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-6 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-12 lg:pt-14">
      {left}
      {right}
    </section>
  );
}
