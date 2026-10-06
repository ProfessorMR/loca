import {
  Coffee,
  Hotel,
  Martini,
  Utensils,
  TreePine,
} from "lucide-react";

const categories = [
  {
    name: "Restaurants",
    icon: Utensils,
  },
  {
    name: "Cafes",
    icon: Coffee,
  },
  {
    name: "Bars",
    icon: Martini,
  },
  {
    name: "Hotels",
    icon: Hotel,
  },
  {
    name: "Parks",
    icon: TreePine,
  },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Explore
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Browse by category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              type="button"
              className="group flex min-h-32 flex-col justify-between rounded-2xl border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
            >
              <Icon
                className="size-6 text-muted-foreground transition-colors group-hover:text-emerald-600"
                aria-hidden="true"
              />

              <span className="text-sm font-medium">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}