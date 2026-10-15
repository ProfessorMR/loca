const ABBREVIATIONS: [RegExp, string][] = [
  [/\bAvenue\b/g, "Ave"],
  [/\bStreet\b/g, "St"],
  [/\bBoulevard\b/g, "Blvd"],
  [/\bRoad\b/g, "Rd"],
  [/\bDrive\b/g, "Dr"],
  [/\bPlace\b/g, "Pl"],
  [/\bParkway\b/g, "Pkwy"],
  [/\bHighway\b/g, "Hwy"],
  [/\bNorth\b/g, "N"],
  [/\bSouth\b/g, "S"],
  [/\bEast\b/g, "E"],
  [/\bWest\b/g, "W"],
];

const HOUSE_NUMBER = /^\d+(?:[-–]\d+)?[A-Za-z]?$/;
const STATE_OR_ZIP = /^(?:[A-Z]{2}|\d{5}(?:-\d{4})?)$/;

/**
 * "679, Riverside Drive, New York, NY, 10031" -> "679 Riverside Dr"
 * "2152, Lemoine Avenue, Fort Lee, NJ, 07024"  -> "2152 Lemoine Ave, Fort Lee"
 *
 * Returns null when there is no real street address (e.g. just "New York, NY"),
 * so the card can hide the line instead of showing something useless.
 */
export function formatStreetAddress(address: string | null | undefined): string | null {
  if (!address) return null;

  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  if (parts.length < 2 || !HOUSE_NUMBER.test(parts[0])) return null;
  if (parts[1].includes(";") || STATE_OR_ZIP.test(parts[1])) return null;

  let street = parts[1];
  for (const [pattern, replacement] of ABBREVIATIONS) {
    street = street.replace(pattern, replacement);
  }

  const city = parts[2];
  const showCity =
    city && !STATE_OR_ZIP.test(city) && city.toLowerCase() !== "new york";

  return showCity ? `${parts[0]} ${street}, ${city}` : `${parts[0]} ${street}`;
}
