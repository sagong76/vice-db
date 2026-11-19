import { memo } from 'react';

function LeonidaMapBase() {
  return (
    <img
      src="/images/map/leonida-map.webp"
      alt="Interactive map of GTA 6 Leonida"
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'fill' }}
      className="absolute inset-0 block select-none pointer-events-none"
    />
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
