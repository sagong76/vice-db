import { memo } from 'react';
import { Gauge, MapPin, MapPinned, Zap } from 'lucide-react';
import type { Vehicle } from '../types';
import { classColor, formatPrice } from '../utils';
import { StatBar } from './StatBar';

interface VehicleCardProps {
  vehicle: Vehicle;
  onOpenSpecs: (id: string) => void;
  onLocate: (pinId: string) => void;
}

function VehicleCardBase({ vehicle, onOpenSpecs, onLocate }: VehicleCardProps) {
  const colors = classColor(vehicle.class);
  const isFree = vehicle.free_spawn.toLowerCase() === 'yes';
  const hasPin = !!vehicle.pin_id;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-600 bg-ink-800 shadow-card transition hover:border-ink-500 hover:shadow-neon-cyan">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-ink-850">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.manufacturer} ${vehicle.name} - GTA 6 vehicle inspired by ${vehicle.real_car}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0.2';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className={`rounded-md border ${colors.border} ${colors.bg} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
            {vehicle.class}
          </span>
          {isFree && (
            <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Free Spawn
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-display text-lg font-bold leading-tight text-white">
          {vehicle.manufacturer} {vehicle.name}
        </h3>
        <p className="mt-0.5 text-xs text-ink-200">
          Real-life: <span className="text-ink-100">{vehicle.real_car}</span>
        </p>

        {/* Stats */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-cyan-neon" />
            <div className="flex-1">
              <StatBar label="Top Speed" value={vehicle.speed} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 shrink-0 text-pink-neon" />
            <div className="flex-1">
              <StatBar label="Accel" value={vehicle.accel} />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-ink-300">Price</span>
          <span className="font-display text-xl font-bold text-white">
            {formatPrice(vehicle.price)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {hasPin ? (
            <button
              onClick={() => onLocate(vehicle.pin_id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-600 bg-ink-850 px-2 py-2 text-xs font-semibold text-ink-100 transition hover:border-cyan-neon/50 hover:text-cyan-neon"
            >
              <MapPinned className="h-3.5 w-3.5" />
              Map Location
            </button>
          ) : (
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-700 px-2 py-2 text-xs text-ink-300">
              <MapPin className="h-3.5 w-3.5" />
              No free spawn
            </span>
          )}
          <button
            onClick={() => onOpenSpecs(vehicle.id)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-pink-neon to-pink-soft px-2 py-2 text-xs font-bold text-white transition hover:shadow-neon-pink"
          >
            Specs
          </button>
        </div>
      </div>
    </article>
  );
}

export const VehicleCard = memo(VehicleCardBase);
