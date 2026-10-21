/** "Joe's Pizza" -> "JP", "Grind" -> "G". Empty when the name has no letters. */
export function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => Array.from(word).find((char) => /[\p{L}\p{N}]/u.test(char)))
    .filter((char): char is string => Boolean(char));

  if (words.length === 0) return "";

  const initials =
    words.length === 1 ? words[0] : `${words[0]}${words[1]}`;

  return initials.toLocaleUpperCase();
}
