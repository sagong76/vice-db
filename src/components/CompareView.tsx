import { useMemo } from 'react';
import { Crown, GitCompare, X } from 'lucide-react';
import type { Vehicle } from '../types';
import { classColor, formatPrice } from '../utils';

interface CompareViewProps {
  vehicles: Vehicle[];
  compareIds: string[];
  onSetSlot: (index: number, id: string) => void;
  onClearSlot: (index: number) => void;
  onOpenSpecs: (id: string) => void;
}

const NUMERIC_ROWS: { key: keyof Vehicle; label: string; format: (v: number) => string; max: number }[] = [
  { key: 'price', label: 'Price', format: (v) => formatPrice(v), max: 0 },
  { key: 'speed', label: 'Top Speed', format: (v) => `${v}/100`, max: 100 },
  { key: 'accel', label: 'Acceleration', format: (v) => `${v}/100`, max: 100 },
  { key: 'handling', label: 'Handling', format: (v) => `${v}/100`, max: 100 },
];

// For price, lower is better (winner). For stats, higher is better.
function findWinners(values: number[], max: number): boolean[] {
  if (values.every((v) => v === 0)) return values.map(() => false);
  if (max === 0) {
    // price: lowest wins
    const min = Math.min(...values.filter((v) => v > 0));
    return values.map((v) => v === min);
  }
  const maxVal = Math.max(...values);
  return values.map((v) => v === maxVal);
}

export function CompareView({
  vehicles,
  compareIds,
  onSetSlot,
  onClearSlot,
  onOpenSpecs,
}: CompareViewProps) {
  const slots = useMemo(
    () => [0, 1, 2].map((i) => vehicles.find((v) => v.id === compareIds[i]) ?? null),
    [vehicles, compareIds],
  );

  const filled = slots.filter(Boolean) as Vehicle[];

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-5">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          <GitCompare className="h-6 w-6 text-cyan-neon" />
          Compare Vehicles
        </h1>
        <p className="mt-1 text-sm text-ink-200">
          Select up to 3 vehicles to compare specs side by side. The best stat in each row is highlighted in cyan.
        </p>
      </div>

      {/* Slot selectors */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => {
          const v = slots[i];
          return (
            <div
              key={i}
              className="relative rounded-xl border border-ink-600 bg-ink-800 p-3"
            >
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-ink-300">
                Slot {i + 1}
              </label>
              {v ? (
                <div className="flex items-center gap-3">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="h-14 w-20 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-white">{v.manufacturer} {v.name}</p>
                    <p className="truncate text-xs text-ink-200">{v.real_car}</p>
                    <button
                      onClick={() => onOpenSpecs(v.id)}
                      className="mt-1 text-[11px] font-medium text-pink-neon hover:underline"
                    >
                      View specs
                    </button>
                  </div>
                  <button
                    onClick={() => onClearSlot(i)}
                    className="rounded-md p-1 text-ink-300 transition hover:bg-ink-700 hover:text-white"
                    aria-label="Clear slot"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <select
                  value=""
                  onChange={(e) => e.target.value && onSetSlot(i, e.target.value)}
                  className="w-full rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm text-white outline-none focus:border-cyan-neon/60"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles
                    .filter((vv) => !compareIds.includes(vv.id))
                    .map((vv) => (
                      <option key={vv.id} value={vv.id}>
                        {vv.manufacturer} {vv.name} ({vv.class})
                      </option>
                    ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {filled.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-600 bg-ink-850 px-6 py-16 text-center">
          <GitCompare className="mx-auto mb-3 h-10 w-10 text-ink-400" />
          <p className="text-ink-200">Pick at least one vehicle above to start comparing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-600">
          {/* Header row with thumbnails */}
          <div className="grid bg-ink-850" style={{ gridTemplateColumns: `160px repeat(${filled.length}, 1fr)` }}>
            <div className="border-r border-ink-600 p-3 text-[11px] font-semibold uppercase tracking-widest text-ink-300">
              Vehicle
            </div>
            {filled.map((v) => {
              const colors = classColor(v.class);
              return (
                <div key={v.id} className="border-r border-ink-600 p-3 last:border-r-0">
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-ink-900">
                    <img src={v.image_url} alt={v.name} className="h-full w-full object-cover" />
                    <span className={`absolute left-1 top-1 rounded border ${colors.border} ${colors.bg} px-1.5 py-0.5 text-[9px] font-semibold uppercase ${colors.text}`}>
                      {v.class}
                    </span>
                  </div>
                  <p className="truncate font-display text-sm font-bold text-white">{v.manufacturer} {v.name}</p>
                </div>
              );
            })}
          </div>

          {/* Numeric rows */}
          {NUMERIC_ROWS.map((row, ri) => {
            const values = filled.map((v) => Number(v[row.key]) || 0);
            const winners = findWinners(values, row.max);
            return (
              <div
                key={row.key}
                className={`grid ${ri % 2 ? 'bg-ink-850' : 'bg-ink-800'}`}
                style={{ gridTemplateColumns: `160px repeat(${filled.length}, 1fr)` }}
              >
                <div className="border-r border-ink-600 p-3 text-xs font-medium uppercase tracking-wider text-ink-200">
                  {row.label}
                </div>
                {filled.map((v, ci) => {
                  const isWinner = winners[ci] && filled.length > 1;
                  return (
                    <div
                      key={v.id}
                      className={`relative flex items-center gap-1.5 border-r border-ink-600 p-3 last:border-r-0 ${
                        isWinner ? 'bg-cyan-neon/10' : ''
                      }`}
                    >
                      <span className={`font-display text-base font-bold ${isWinner ? 'text-cyan-neon' : 'text-white'}`}>
                        {row.format(Number(v[row.key]) || 0)}
                      </span>
                      {isWinner && <Crown className="h-3.5 w-3.5 text-cyan-neon" />}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Text rows */}
          {([
            ['Real-Life Counterpart', (v: Vehicle) => v.real_car],
            ['Free Spawn', (v: Vehicle) => (v.free_spawn.toLowerCase() === 'yes' ? 'Yes' : 'No')],
          ] as const).map(([label, getter], ri) => {
            return (
              <div
                key={label}
                className={`grid ${ri % 2 ? 'bg-ink-850' : 'bg-ink-800'}`}
                style={{ gridTemplateColumns: `160px repeat(${filled.length}, 1fr)` }}
              >
                <div className="border-r border-ink-600 p-3 text-xs font-medium uppercase tracking-wider text-ink-200">
                  {label}
                </div>
                {filled.map((v) => {
                  const val = getter(v);
                  const isFree = label === 'Free Spawn' && val === 'Yes';
                  return (
                    <div
                      key={v.id}
                      className={`border-r border-ink-600 p-3 text-sm last:border-r-0 ${
                        isFree ? 'text-emerald-400' : 'text-ink-100'
                      }`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
