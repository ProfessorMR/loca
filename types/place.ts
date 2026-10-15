export type Place = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rating: number | null;
  priceLevel: string | null;
  distance: string | null;
  image: string | null;
  description: string | null;
  address: string | null;
  openingHours?: string | null;
  latitude: number;
  longitude: number;
};

export type CategoryCount = {
  name: string;
  count: number;
};
