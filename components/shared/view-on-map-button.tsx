"use client";

export function ViewOnMapButton() {
  function handleClick() {
    document.getElementById("place-location-map")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
    >
      View on map
    </button>
  );
}
