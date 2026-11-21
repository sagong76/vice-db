import { memo } from 'react';
import { Anchor, Bike, Camera, Car, Truck } from 'lucide-react';
import type { Vehicle } from '../types';
import { displayName } from '../utils';

interface VehicleImageProps {
  vehicle: Vehicle;
  size: 'card' | 'hero' | 'thumb';
  className?: string;
}

function iconFor(cls: string) {
  const c = cls.toLowerCase();
  if (c.includes('boat')) return Anchor;
  if (c.includes('motor') || c.includes('bike')) return Bike;
  if (c.includes('suv') || c.includes('off') || c.includes('truck') || c.includes('emergency')) return Truck;
  return Car;
}

/**
 * Shows our own in-game screenshot when one exists. Otherwise a neutral class
 * placeholder: never a stock photo of a real car, which would misrepresent the game.
 */
function VehicleImageBase({ vehicle, size, className = '' }: VehicleImageProps) {
  const name = displayName(vehicle);
  if (vehicle.image) {
    const src = size === 'hero' ? vehicle.image : vehicle.image.replace(/\.webp$/, '-640.webp');
    return (
      <img
        src={src}
        alt={`${name} in GTA 6 (in-game screenshot)`}
        loading={size === 'hero' ? 'eager' : 'lazy'}
        width={size === 'hero' ? 1280 : 640}
        height={size === 'hero' ? 720 : 360}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const Icon = iconFor(vehicle.class);
  return (
    <div
      role="img"
      aria-label={`${name}: in-game screenshot coming soon`}
      className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_at_50%_40%,rgba(255,42,133,0.14),transparent_60%),linear-gradient(135deg,#131822,#0e121a)] text-ink-300 ${className}`}
    >
      <Icon className={size === 'thumb' ? 'h-6 w-6' : size === 'hero' ? 'h-16 w-16' : 'h-10 w-10'} strokeWidth={1.25} />
      {size !== 'thumb' && (
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
          <Camera className="h-3 w-3" /> Screenshot coming soon
        </span>
      )}
    </div>
  );
}

export const VehicleImage = memo(VehicleImageBase);
