import type { Place } from "@/types/place";

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
];
export function getPlaceById(id: string) {
  return places.find((place) => place.id === id);
}

export function searchPlaces(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return places;
  }

  const terms = normalizedQuery.split(/\s+/);

  return places
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

      const score = terms.reduce((total, term) => {
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
