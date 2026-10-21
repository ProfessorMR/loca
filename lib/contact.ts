/**
 * Contact details come from volunteers on OpenStreetMap, so they are checked
 * before they become links: a website must be a real http(s) address and a
 * phone number must look like one.
 */

export function safeWebsite(
  raw: string | null | undefined,
): { href: string; label: string } | null {
  if (!raw) return null;

  // some places list several values: "a.com;b.com"
  const first = raw.split(/[;,\s]/).find((part) => part.trim().length > 0);
  if (!first) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(first)
    ? first
    : `https://${first}`;

  try {
    const url = new URL(withScheme);

    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;

    return { href: url.toString(), label: url.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

export function safePhone(
  raw: string | null | undefined,
): { href: string; label: string } | null {
  if (!raw) return null;

  const first = raw.split(/[;,]/)[0]?.trim() ?? "";

  if (!/^[0-9+().\-\s]+$/.test(first)) return null;

  const digits = first.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) return null;

  return {
    href: `tel:${first.startsWith("+") ? "+" : ""}${digits}`,
    label: first,
  };
}

export function directionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
