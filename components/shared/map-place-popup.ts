import type { Place } from "@/types/place";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createPlacePopupContent(place: Place) {
  const name = escapeHtml(place.name);
  const category = escapeHtml(place.category);

  const imageContent = place.image
    ? `
      <img
        src="${escapeHtml(place.image)}"
        alt="${name}"
      />
    `
    : `
      <div class="loca-popup__image-placeholder">
        No image available
      </div>
    `;

  const metaItems = [
    place.priceLevel ? escapeHtml(place.priceLevel) : null,
    place.distance ? escapeHtml(place.distance) : null,
  ].filter(Boolean);

  const ratingContent =
    place.rating !== null
      ? `
        <div class="loca-popup__rating">
          <span>★</span>
          ${place.rating.toFixed(1)}
        </div>
      `
      : "";

  const descriptionContent = place.description
    ? `
      <p class="loca-popup__description">
        ${escapeHtml(place.description)}
      </p>
    `
    : "";

  return `
    <div class="loca-popup">
      <div class="loca-popup__image">
        ${imageContent}
        <span class="loca-popup__category">
          ${category}
        </span>
      </div>

      <div class="loca-popup__content">
        <div class="loca-popup__header">
          <div>
            <h3 class="loca-popup__title">
              ${name}
            </h3>

            <p class="loca-popup__meta">
              ${[category, ...metaItems].join(" · ")}
            </p>
          </div>

          ${ratingContent}
        </div>

        ${descriptionContent}

        <a
          href="/places/${encodeURIComponent(place.id)}"
          class="loca-popup__button"
        >
          View place
          <span>↗</span>
        </a>
      </div>
    </div>
  `;
}
