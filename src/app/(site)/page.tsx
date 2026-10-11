import { Suspense } from "react";

import { Benefits } from "@/features/home/components/benefits";
import { GiftStory } from "@/features/home/components/gift-story";
import { Hero } from "@/features/home/components/hero";
import { HomeCategories } from "@/features/home/components/home-categories";
import { Occasions } from "@/features/home/components/occasions";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Benefits />
      {/* Datos del catálogo: se leen por request (con caché); el resto es estático. */}
      <Suspense fallback={null}>
        <HomeCategories />
      </Suspense>
      <Occasions />
      <GiftStory />
    </main>
  );
}
