import { memo } from 'react';

function LeonidaMapBase() {
  return (
    <img
      src="/images/map/leonida-map.svg"
      alt="Interactive map of GTA 6 Leonida"
      draggable={false}
      className="block h-auto w-full min-h-[600px] select-none pointer-events-none"
    />
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
