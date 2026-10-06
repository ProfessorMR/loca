import { Categories } from "@/components/shared/categories";
import { Hero } from "@/components/shared/hero";
import { Navbar } from "@/components/shared/navbar";
import { NearbyPlaces } from "@/components/shared/nearby-places";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <Hero />

      <Categories />

      <NearbyPlaces />
    </main>
  );
}