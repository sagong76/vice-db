import { memo } from 'react';

function LeonidaMapBase() {
  return (
    <div
      style={{ width: '100%', height: '100%', backgroundColor: '#d8e2ec' }}
      className="absolute inset-0 overflow-hidden"
    >
      <img
        src="/images/map/leonida-map.webp"
        alt="Interactive map of GTA 6 Leonida"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
        className="block select-none pointer-events-none"
      />
    </div>
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
