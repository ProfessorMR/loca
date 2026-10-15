import { Hero } from "@/components/shared/hero";
import { describeCategories } from "@/lib/category-labels";
import { getCategoryCounts, getPopularSearchTerms } from "@/lib/places";

/** Hero whose text and quick searches come from the database. */
export async function HeroSection() {
  const [categories, popularSearches] = await Promise.all([
    getCategoryCounts(),
    getPopularSearchTerms(4),
  ]);

  const total = categories.reduce((sum, category) => sum + category.count, 0);

  const subtitle =
    total > 0
      ? `Search ${total.toLocaleString("en-US")} places across ${describeCategories(
          categories.map((category) => category.name),
        )}. Tell us what you're craving and we'll find it.`
      : undefined;

  return <Hero popularSearches={popularSearches} subtitle={subtitle} />;
}
