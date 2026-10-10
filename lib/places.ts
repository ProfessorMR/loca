import { rankPlaces } from "@/lib/place-ranking";
import { extractSearchIntent } from "@/lib/search-intent-service";
import type { Place } from "@/types/place";
import type { SearchIntent } from "@/types/search";

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
    tags: ["coffee", "work-friendly", "quiet", "cozy", "casual"],
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

export async function searchPlaces(
  query: string,
): Promise<{ places: Place[]; intent: SearchIntent | null }> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      places,
      intent: null,
    };
  }

  const intent = await extractSearchIntent(query);

  return {
    places: rankPlaces(places, intent),
    intent,
  };
}

export function getPlaceCategories() {
  return Array.from(new Set(places.map((place) => place.category)));
}
