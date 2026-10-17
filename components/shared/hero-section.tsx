import { Hero } from "@/components/shared/hero";
import { isAiConfigured } from "@/lib/ai-intent-extractor";
import { describeCategories } from "@/lib/category-labels";
import { getCategoryCounts, getSearchSuggestions } from "@/lib/places";

/** Hero whose text and example searches come from the database. */
export async function HeroSection() {
  const [categories, suggestions] = await Promise.all([
    getCategoryCounts(),
    getSearchSuggestions(3),
  ]);

  const total = categories.reduce((sum, category) => sum + category.count, 0);
  const lead = isAiConfigured()
    ? "Describe what you're after in your own words"
    : "Tell us what you're looking for";

  const subtitle =
    total > 0
      ? `${lead} and we'll search ${total.toLocaleString("en-US")} places across ${describeCategories(
          categories.map((category) => category.name),
        )}.`
      : undefined;

  return (
    <Hero
      popularSearches={suggestions}
      subtitle={subtitle}
      placeholder={suggestions[0] ? `Try “${suggestions[0]}”` : undefined}
    />
  );
}
