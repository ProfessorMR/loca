export type SearchIntent = {
  query: string;
  category?: string;
  tags: string[];
  priceLevel?: string;
  sort: "recommended" | "rating" | "distance";
};
