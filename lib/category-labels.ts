// Display names for categories. Unknown categories fall back to their own name,
// so a new category in the database still shows up.
const categoryLabels: Record<string, string> = {
  Restaurant: "Restaurants",
  "Fast Food": "Fast Food",
  Cafe: "Cafes",
};

export function getCategoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}

/** "restaurants, fast food and cafes" */
export function describeCategories(categories: string[]): string {
  const labels = categories.map((category) =>
    getCategoryLabel(category).toLowerCase(),
  );

  if (labels.length <= 1) return labels[0] ?? "";

  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
