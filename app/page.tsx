import { Categories } from "@/components/shared/categories";
import { Hero } from "@/components/shared/hero";
import { HeroSection } from "@/components/shared/hero-section";
import { Navbar } from "@/components/shared/navbar";
import { NearbyPlaces } from "@/components/shared/nearby-places";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Suspense fallback={<Hero />}>
        <HeroSection />
      </Suspense>

      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-56 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          </section>
        }
      >
        <Categories />
      </Suspense>

      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-8">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-64 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-3xl bg-muted"
                />
              ))}
            </div>
          </section>
        }
      >
        <NearbyPlaces />
      </Suspense>
    </main>
  );
}
