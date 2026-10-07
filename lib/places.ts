import type { Place } from "@/types/place";

export const places: Place[] = [
  {
    id: "1",
    name: "The Green Table",
    category: "Restaurant",
    rating: 4.8,
    priceLevel: "$$",
    distance: "1.2 km",
    image: "/places/restaurant.webp",
    description:
      "A cozy neighborhood restaurant with a relaxed atmosphere, great food, and a comfortable setting for a casual dinner.",
    address: "123 Main Street",
  },
  {
    id: "2",
    name: "Morning Roast",
    category: "Cafe",
    rating: 4.7,
    priceLevel: "$$",
    distance: "0.8 km",
    image: "/places/cafe.jpg",
    description:
      "A relaxed neighborhood cafe serving quality coffee in a comfortable space for working, meeting, or taking a break.",
    address: "45 Oak Avenue",
  },
  {
    id: "3",
    name: "Oak Garden",
    category: "Park",
    rating: 4.6,
    priceLevel: "Free",
    distance: "2.0 km",
    image: "/places/park.jpg",
    description:
      "A peaceful green space with walking paths and plenty of room to relax away from the busy streets.",
    address: "78 Park Road",
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
      const searchableText = [
        place.name,
        place.category,
        place.description,
        place.address,
      ]
        .join(" ")
        .toLowerCase();

      const score = terms.reduce((total, term) => {
        return total + (searchableText.includes(term) ? 1 : 0);
      }, 0);

      return {
        place,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.place);
}
