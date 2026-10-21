import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

// The current time rounded to the minute. The server snapshot is null, so the
// server and the first browser render both show nothing time-based (no
// hydration mismatch) and the real value appears right after mount.
const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => null;

/** Minutes since 1970, or null until the page is in the browser. */
export function useMinute(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
