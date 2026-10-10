import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

type RankedPlace = {
  place: Place;
  score: number;
  matchedTags: number;
};

export function rankPlaces(places: Place[], intent: SearchIntent): Place[] {
  const requestedTags = intent.tags.map((tag) => tag.toLowerCase());
  const query = intent.query.toLowerCase().trim();

  const rankedPlaces = places
    .filter((place) => {
      if (intent.category && place.category !== intent.category) {
        return false;
      }

      if (intent.priceLevel && place.priceLevel !== intent.priceLevel) {
        return false;
      }

      return true;
    })
    .map((place): RankedPlace => {
      const tags = place.tags.map((tag) => tag.toLowerCase());

      const matchedTags = requestedTags.filter((tag) =>
        tags.includes(tag),
      ).length;

      const tagScore = matchedTags * 10;

      const priceScore =
        intent.priceLevel && place.priceLevel === intent.priceLevel ? 4 : 0;

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

      return {
        place,
        matchedTags,
        score: tagScore + priceScore + textScore,
      };
    })
    .filter(
      ({ score, place }) =>
        score > 0 ||
        Boolean(intent.category && place.category === intent.category) ||
        Boolean(intent.priceLevel && place.priceLevel === intent.priceLevel),
    );

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

      if (b.matchedTags !== a.matchedTags) {
        return b.matchedTags - a.matchedTags;
      }

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.place.rating - a.place.rating;
    })
    .map(({ place }) => place);
}
