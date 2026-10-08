import type { Place } from "@/types/place";
import { parseSearchIntent } from "@/lib/search-intent";

export const places: Place[] = [
  {
    id: "1",
    name: "The Green Table",
    category: "Restaurant",
    tags: ["dinner", "cozy", "casual", "food"],
    rating: 4.8,
    priceLevel: "$$",
    distance: "1.2 km",
    image: "/places/restaurant.webp",
    description:
      "A cozy neighborhood restaurant with a relaxed atmosphere, great food, and a comfortable setting for a casual dinner.",
    address: "123 Main Street",
    latitude: 35.7219,
    longitude: 51.3347,
  },
  {
    id: "2",
    name: "Morning Roast",
    category: "Cafe",
    tags: ["coffee", "work-friendly", "quiet", "casual"],
    rating: 4.7,
    priceLevel: "$$",
    distance: "0.8 km",
    image: "/places/cafe.jpg",
    description:
      "A relaxed neighborhood cafe serving quality coffee in a comfortable space for working, meeting, or taking a break.",
    address: "45 Oak Avenue",
    latitude: 35.7038,
    longitude: 51.391,
  },
  {
    id: "3",
    name: "Oak Garden",
    category: "Park",
    tags: ["nature", "quiet", "relaxing", "outdoor"],
    rating: 4.6,
    priceLevel: "Free",
    distance: "2.0 km",
    image: "/places/park.jpg",
    description:
      "A peaceful green space with walking paths and plenty of room to relax away from the busy streets.",
    address: "78 Park Road",
    latitude: 35.735,
    longitude: 51.425,
  },
  {
    id: "4",
    name: "Corner Coffee",
    category: "Cafe",
    tags: ["coffee", "casual", "work-friendly"],
    rating: 4.4,
    priceLevel: "$",
    distance: "1.5 km",
    image: "/places/cafe.jpg",
    description:
      "A casual coffee shop with reliable Wi-Fi and a practical space for getting some work done.",
    address: "12 Cedar Street",
    latitude: 35.712,
    longitude: 51.405,
  },
  {
    id: "5",
    name: "Riverside Cafe",
    category: "Cafe",
    tags: ["coffee", "quiet", "relaxing", "cozy"],
    rating: 4.5,
    priceLevel: "$$",
    distance: "2.4 km",
    image: "/places/cafe.jpg",
    description:
      "A calm cafe by the river with a cozy atmosphere, good coffee, and a relaxing setting.",
    address: "24 River Road",
    latitude: 35.728,
    longitude: 51.418,
  },
  {
    id: "6",
    name: "City Garden",
    category: "Park",
    tags: ["nature", "quiet", "outdoor", "relaxing"],
    rating: 4.3,
    priceLevel: "Free",
    distance: "1.8 km",
    image: "/places/park.jpg",
    description:
      "A quiet urban park with open green spaces and a relaxing environment for spending time outdoors.",
    address: "90 Garden Avenue",
    latitude: 35.741,
    longitude: 51.432,
  },
];
export function getPlaceById(id: string) {
  return places.find((place) => place.id === id);
}

export function searchPlaces(query: string) {
  const intent = parseSearchIntent(query);
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return places;
  }

  const terms = normalizedQuery.split(/\s+/);

  const filteredPlaces = places.filter((place) => {
    const matchesCategory =
      !intent.category || place.category === intent.category;

    const matchesPrice =
      !intent.priceLevel || place.priceLevel === intent.priceLevel;

    return matchesCategory && matchesPrice;
  });

  return filteredPlaces
    .map((place) => {
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

        if (description.includes(term)) {
          return total + 2;
        }

        if (tags.some((tag) => tag.includes(term))) {
          return total + 3;
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

      const score = textScore + intentScore;

      return {
        place,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.place.rating !== a.place.rating) {
        return b.place.rating - a.place.rating;
      }

      const distanceA = parseFloat(a.place.distance);
      const distanceB = parseFloat(b.place.distance);

      return distanceA - distanceB;
    })
    .map((result) => result.place);
}

export function getPlaceCategories() {
  return Array.from(new Set(places.map((place) => place.category)));
}
