import { useMemo, useState } from 'react';
import { ArrowDownNarrowWide, Check, SlidersHorizontal } from 'lucide-react';
import type { Vehicle } from '../types';
import { CLASSES } from '../data';
import { classColor } from '../utils';
import { AdSlot } from './AdSlot';
import { VehicleCard } from './VehicleCard';

interface VehicleDBViewProps {
  vehicles: Vehicle[];
  globalSearch: string;
  navigate: (path: string) => void;
}

type ClassFilter = string;
type SortKey = 'price' | 'speed' | 'name';

const PILLS: ClassFilter[] = ['All', ...CLASSES, 'Free Spawn Only'];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'price', label: 'Price (High to Low)' },
  { key: 'speed', label: 'Top Speed (High to Low)' },
  { key: 'name', label: 'Name (A-Z)' },
];

export function VehicleDBView({
  vehicles,
  globalSearch,
  navigate,
}: VehicleDBViewProps) {
  const [filter, setFilter] = useState<ClassFilter>('All');
  const [sort, setSort] = useState<SortKey>('price');
  const [sortOpen, setSortOpen] = useState(false);

  const query = globalSearch.toLowerCase().trim();

  const filtered = useMemo(() => {
    let list = [...vehicles];
    if (filter === 'Free Spawn Only') {
      list = list.filter((v) => v.free_spawn.toLowerCase() === 'yes');
    } else if (filter !== 'All') {
      list = list.filter((v) => v.class === filter);
    }
    if (query) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.manufacturer.toLowerCase().includes(query) ||
          v.real_car.toLowerCase().includes(query) ||
          v.class.toLowerCase().includes(query),
      );
    }
    list.sort((a, b) => {
      if (sort === 'price') return b.price - a.price;
      if (sort === 'speed') return b.speed - a.speed;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [vehicles, filter, sort, query]);

  const currentSortLabel = SORTS.find((s) => s.key === sort)?.label ?? '';

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-5">
      {/* Page heading */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          GTA 6 Vehicle Database
        </h1>
        <p className="mt-1 text-sm text-ink-200">
          {vehicles.length} GTA 6 vehicles with real-life counterparts, prices, performance ratings and free-spawn
          locations. Entries marked unverified come from trailers and community reports and are updated once
          confirmed in-game.
        </p>
      </div>

      {/* Leaderboard ad */}
      <div className="mb-6">
        <AdSlot variant="leaderboard" label="Advertisement" />
      </div>

      {/* Filters + Sort */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {PILLS.map((p) => {
            const active = filter === p;
            const colors = p !== 'All' && p !== 'Free Spawn Only' ? classColor(p) : null;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? colors
                      ? `${colors.bg} ${colors.text} ${colors.border} border`
                      : 'border border-pink-neon/50 bg-pink-neon/10 text-pink-neon'
                    : 'border border-ink-600 bg-ink-850 text-ink-200 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            onBlur={() => setTimeout(() => setSortOpen(false), 150)}
            className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm text-white transition hover:bg-ink-800"
          >
            <SlidersHorizontal className="h-4 w-4 text-cyan-neon" />
            <span className="hidden whitespace-nowrap sm:inline">{currentSortLabel}</span>
            <span className="sm:hidden">Sort</span>
            <ArrowDownNarrowWide className="h-3.5 w-3.5 text-ink-300" />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-ink-600 bg-ink-800 shadow-card animate-scaleIn">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSort(s.key);
                    setSortOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-100 transition hover:bg-ink-700"
                >
                  {s.label}
                  {sort === s.key && <Check className="h-4 w-4 text-cyan-neon" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-ink-300">
        Showing <span className="font-semibold text-white">{filtered.length}</span> vehicle{filtered.length === 1 ? '' : 's'}
      </p>

      {/* Grid with in-feed native ads every 6 cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-ink-600 bg-ink-850 px-6 py-16 text-center">
          <p className="text-ink-200">No vehicles match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v, i) => (
            <div key={v.id} className="contents">
              <VehicleCard
                vehicle={v}
                navigate={navigate}
              />
              {(i + 1) % 6 === 0 && i !== filtered.length - 1 && (
                <div className="col-span-full my-1 flex justify-center">
                  <AdSlot variant="native" label="Sponsored - In-Feed" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
