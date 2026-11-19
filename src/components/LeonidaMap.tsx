import { memo } from 'react';

function LeonidaMapBase() {
  return (
    <img
      src="/images/map/leonida-map.svg"
      alt="Interactive map of GTA 6 Leonida"
      draggable={false}
      className="absolute inset-0 h-full w-full select-none pointer-events-none"
    />
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
