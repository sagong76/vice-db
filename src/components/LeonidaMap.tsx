import { memo } from 'react';

/**
 * Stylized dark-mode SVG map of GTA 6 Leonida.
 * Uses a 0–100 viewBox so map pins (positioned by percentage) align perfectly.
 * Regions: Vice Beach (east), Starfish Island, Lake Leonida (center),
 * Port Gellhorn (west), Grassrivers (southwest), Leonida Keys (south).
 */
function LeonidaMapBase() {
  return (
  <img
  src="/images/map/leonida-map.svg"
  alt="Leonida Interactive Map"
  className="w-full h-full object-contain select-none pointer-events-none"
/>  
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
