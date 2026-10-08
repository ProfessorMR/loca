import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type RankedPlace = {
  place: Place;
  score: number;
};

export function rankPlaces(places: Place[], intent: SearchIntent): Place[] {
  const normalizedQuery = intent.query.toLowerCase().trim();

  const terms = normalizedQuery ? normalizedQuery.split(/\s+/) : [];

  const rankedPlaces = places
    .map((place): RankedPlace => {
      const name = place.name.toLowerCase();
      const category = place.category.toLowerCase();
      const description = place.description.toLowerCase();
      const address = place.address.toLowerCase();
      const tags = place.tags.map((tag) => tag.toLowerCase());

      const searchableText = [
        name,
        category,
        description,
        address,
        ...tags,
      ].join(" ");

      const textScore = terms.reduce((total, term) => {
        if (name.includes(term)) {
          return total + 4;
        }

        if (category.includes(term)) {
          return total + 3;
        }

        if (tags.some((tag) => tag.includes(term))) {
          return total + 3;
        }

        if (description.includes(term)) {
          return total + 2;
        }

        if (address.includes(term)) {
          return total + 1;
        }

        if (searchableText.includes(term)) {
          return total + 1;
        }

        return total;
      }, 0);

      const intentScore =
        (intent.category && place.category === intent.category ? 8 : 0) +
        intent.tags.reduce(
          (total, tag) =>
            total + (place.tags.some((placeTag) => placeTag === tag) ? 5 : 0),
          0,
        ) +
        (intent.priceLevel && place.priceLevel === intent.priceLevel ? 6 : 0);

      return {
        place,
        score: textScore + intentScore,
      };
    })
    .filter((result) => result.score > 0);

  return rankedPlaces
    .sort((a, b) => {
      if (intent.sort === "rating") {
        if (b.place.rating !== a.place.rating) {
          return b.place.rating - a.place.rating;
        }
      }

      if (intent.sort === "distance") {
        const distanceA = Number.parseFloat(a.place.distance);
        const distanceB = Number.parseFloat(b.place.distance);

        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }
      }

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.place.rating !== a.place.rating) {
        return b.place.rating - a.place.rating;
      }

      const distanceA = Number.parseFloat(a.place.distance);
      const distanceB = Number.parseFloat(b.place.distance);

      return distanceA - distanceB;
    })
    .map((result) => result.place);
}
