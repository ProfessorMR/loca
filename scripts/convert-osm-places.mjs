import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, "../new-york-places.geojson");

const outputPath = path.resolve(__dirname, "../new-york-places.csv");

const geojson = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!Array.isArray(geojson.features)) {
  throw new Error("Invalid GeoJSON: features array not found.");
}

function getCoordinates(feature) {
  const coordinates = feature.geometry?.coordinates;

  if (feature.geometry?.type === "Point") {
    return {
      longitude: coordinates?.[0],
      latitude: coordinates?.[1],
    };
  }

  return {
    longitude:
      feature.properties?.["@geometry"] === "center"
        ? coordinates?.[0]
        : undefined,
    latitude:
      feature.properties?.["@geometry"] === "center"
        ? coordinates?.[1]
        : undefined,
  };
}

function getCategory(tags) {
  if (tags.amenity === "cafe") return "Cafe";
  if (tags.amenity === "restaurant") return "Restaurant";
  if (tags.amenity === "fast_food") return "Fast Food";
  if (tags.leisure === "park") return "Park";
  if (tags.tourism === "museum") return "Museum";
  if (tags.tourism === "gallery") return "Gallery";

  return null;
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

const headers = [
  "id",
  "name",
  "category",
  "tags",
  "rating",
  "priceLevel",
  "distance",
  "image",
  "description",
  "address",
  "latitude",
  "longitude",
  "createdAt",
  "updatedAt",
  "osmId",
  "imageAttribution",
  "imageLicense",
  "imageSource",
  "ratingCount",
  "ratingSource",
  "source",
  "openingHours",
  "phone",
  "website",
  "wikimediaCommons",
];

const now = new Date().toISOString().slice(0, 19);

const rows = geojson.features
  .map((feature) => {
    const tags = feature.properties ?? {};
    const osmId = feature.id ?? tags["@id"];
    const name = tags.name?.trim();
    const category = getCategory(tags);
    const { latitude, longitude } = getCoordinates(feature);

    if (
      !name ||
      !category ||
      !osmId ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"],
      tags["addr:state"],
      tags["addr:postcode"],
    ].filter(Boolean);

    const row = {
      id: `osm-${String(osmId).replace("/", "-")}`,
      name,
      category,
      tags: "",
      rating: "",
      priceLevel: "",
      distance: "",
      image: "",
      description: "",
      address: addressParts.join(", "),
      latitude,
      longitude,
      createdAt: now,
      updatedAt: now,
      osmId: String(osmId),
      imageAttribution: "",
      imageLicense: "",
      imageSource: "",
      ratingCount: "",
      ratingSource: "",
      source: "openstreetmap",
      openingHours: tags.opening_hours ?? "",
      phone: tags.phone ?? "",
      website: tags.website ?? "",
      wikimediaCommons: tags.wikimedia_commons ?? "",
    };

    return headers.map((header) => escapeCsv(row[header])).join(",");
  })
  .filter(Boolean);

fs.writeFileSync(outputPath, [headers.join(","), ...rows].join("\n"), "utf8");

console.log(`Total GeoJSON features: ${geojson.features.length}`);
console.log(`Valid places exported: ${rows.length}`);
console.log(`CSV saved to: ${outputPath}`);
