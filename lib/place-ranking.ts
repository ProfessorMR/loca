import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type RankedPlace = {
  place: Place;
  score: number;
};

export function rankPlaces(places: Place[], intent: SearchIntent): Place[] {
  const rankedPlaces = places
    .filter((place) => {
      if (intent.category && place.category !== intent.category) {
        return false;
      }

      return true;
    })
    .map((place): RankedPlace => {
      const tags = place.tags.map((tag) => tag.toLowerCase());

      const tagScore = intent.tags.reduce((total, tag) => {
        return total + (tags.includes(tag.toLowerCase()) ? 10 : 0);
      }, 0);

      const priceScore =
        intent.priceLevel && place.priceLevel === intent.priceLevel ? 4 : 0;

      const query = intent.query.toLowerCase().trim();
      const text = [
        place.name,
        place.category,
        place.description,
        place.address,
        ...place.tags,
      ]
        .join(" ")
        .toLowerCase();

      const textScore = query
        .split(/\s+/)
        .filter(Boolean)
        .reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);

      const score = tagScore + priceScore + textScore;

      return { place, score };
    })
    .filter(({ score }) => score > 0);

  return rankedPlaces
    .sort((a, b) => {
      if (intent.sort === "rating" && b.place.rating !== a.place.rating) {
        return b.place.rating - a.place.rating;
      }

      if (intent.sort === "distance") {
        const distanceA = Number.parseFloat(a.place.distance);
        const distanceB = Number.parseFloat(b.place.distance);

        if (
          Number.isFinite(distanceA) &&
          Number.isFinite(distanceB) &&
          distanceA !== distanceB
        ) {
          return distanceA - distanceB;
        }
      }

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.place.rating - a.place.rating;
    })
    .map(({ place }) => place);
}
