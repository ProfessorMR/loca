export const categoryKeywords: Record<string, string> = {
  restaurant: "Restaurant",
  restaurants: "Restaurant",
  cafe: "Cafe",
  cafes: "Cafe",
  coffee: "Cafe",
  bar: "Bar",
  bars: "Bar",
  hotel: "Hotel",
  hotels: "Hotel",
  park: "Park",
  parks: "Park",
};

export const tagKeywords: Record<string, string> = {
  quiet: "quiet",
  calm: "quiet",
  peaceful: "quiet",
  work: "work-friendly",
  working: "work-friendly",
  workspace: "work-friendly",
  coworking: "work-friendly",
  date: "date",
  romantic: "date",
  dinner: "dinner",
  cozy: "cozy",
  comfortable: "cozy",
  casual: "casual",
  nature: "nature",
  relaxing: "relaxing",
  outdoor: "outdoor",
};

export const priceKeywords: Record<string, string> = {
  free: "Free",
  cheap: "$",
  affordable: "$",
  budget: "$",
  inexpensive: "$",
  expensive: "$$$",
  pricey: "$$$",
};

export const intentPhrases = [
  {
    phrases: ["work", "working", "workspace", "coworking", "work from"],
    tag: "work-friendly",
  },
  {
    phrases: ["quiet", "calm", "peaceful", "somewhere quiet", "somewhere calm"],
    tag: "quiet",
  },
  {
    phrases: ["date", "date night", "romantic"],
    tag: "date",
  },
];

export const categoryPhrases: Record<string, string[]> = {
  Cafe: [
    "coffee",
    "cafe",
    "cafes",
    "work",
    "working",
    "workspace",
    "coworking",
    "coffee shop",
  ],
  Restaurant: [
    "restaurant",
    "restaurants",
    "dinner",
    "lunch",
    "food",
    "eat",
    "eating",
  ],
  Bar: ["bar", "bars", "drinks", "drink", "nightlife"],
  Hotel: ["hotel", "hotels", "stay", "overnight"],
  Park: ["park", "parks", "nature", "outdoor", "green space"],
};
