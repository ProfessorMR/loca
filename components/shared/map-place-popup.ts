import type { Place } from "@/types/place";

export function createPlacePopupContent(place: Place) {
  return `
    <div class="loca-popup">
      <div class="loca-popup__image">
        <img
          src="${place.image}"
          alt="${place.name}"
        />
        <span class="loca-popup__category">
          ${place.category}
        </span>
      </div>

      <div class="loca-popup__content">
        <div class="loca-popup__header">
          <div>
            <h3 class="loca-popup__title">
              ${place.name}
            </h3>

            <p class="loca-popup__meta">
              ${place.category} · ${place.priceLevel} · ${place.distance}
            </p>
          </div>

          <div class="loca-popup__rating">
            <span>★</span>
            ${place.rating.toFixed(1)}
          </div>
        </div>

        <p class="loca-popup__description">
          ${place.description}
        </p>

        <a
          href="/places/${place.id}"
          class="loca-popup__button"
        >
          View place
          <span>↗</span>
        </a>
      </div>
    </div>
  `;
}
