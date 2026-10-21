import { CityMapCardSkeleton } from "@/components/shared/city-map-card";
import { Hero } from "@/components/shared/hero";
import { HeroLayout } from "@/components/shared/hero-layout";
import { HeroSection } from "@/components/shared/hero-section";
import { Navbar } from "@/components/shared/navbar";
import { NearbyPlaces } from "@/components/shared/nearby-places";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Suspense
        fallback={
          <HeroLayout left={<Hero />} right={<CityMapCardSkeleton />} />
        }
      >
        <HeroSection />
      </Suspense>

      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
            <div className="mb-8">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-64 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-muted"
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
