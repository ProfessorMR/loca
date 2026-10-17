import { formatStreetAddress } from "@/lib/format-address";
import { getCategoryHue } from "@/lib/category-colors";
import { getOpenStatus } from "@/lib/opening-hours";
import { formatTag, isFeatureTag } from "@/lib/osm-tags";
import type { Place } from "@/types/place";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * The small card shown when a marker is clicked. It only contains what the
 * place really has: no empty photo box, no rating that does not exist.
 * Everything that comes from the data is escaped.
 */
export function createPlacePopupContent(place: Place, now: Date = new Date()) {
  const name = escapeHtml(place.name);
  const category = escapeHtml(place.category);
  const hue = getCategoryHue(place.category);

  const image = place.image
    ? `<div class="loca-popup__image"><img src="${escapeHtml(place.image)}" alt="${name}" /></div>`
    : "";

  // What it serves first, e.g. "Pizza · Italian"
  const kinds = place.tags
    .filter((tag) => !isFeatureTag(tag))
    .slice(0, 2)
    .map((tag) => escapeHtml(formatTag(tag)));

  const status = getOpenStatus(place.openingHours, now);
  const statusLine = status
    ? `<p class="loca-popup__status">
         <span class="loca-popup__dot loca-popup__dot--${status.state}"></span>
         <span><strong>${escapeHtml(status.headline)}</strong>${
           status.detail ? ` · ${escapeHtml(status.detail)}` : ""
         }</span>
       </p>`
    : "";

  const address = formatStreetAddress(place.address);
  const details = [address, place.distance]
    .filter((item): item is string => Boolean(item))
    .map(escapeHtml);

  const detailsLine =
    details.length > 0
      ? `<p class="loca-popup__details">${details.join(" · ")}</p>`
      : "";

  const rating =
    place.rating !== null
      ? `<span class="loca-popup__rating">★ ${place.rating.toFixed(1)}</span>`
      : "";

  return `
    <div class="loca-popup">
      ${image}

      <div class="loca-popup__content">
        <p class="loca-popup__category">
          <span class="loca-popup__swatch" style="background:hsl(${hue} 55% 42%)"></span>
          ${[category, ...kinds].join(" · ")}
        </p>

        <div class="loca-popup__header">
          <h3 class="loca-popup__title">${name}</h3>
          ${rating}
        </div>

        ${statusLine}
        ${detailsLine}

        <a
          href="/places/${encodeURIComponent(place.id)}"
          data-place-link
          class="loca-popup__button"
        >
          View place
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  `;
}
