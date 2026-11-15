import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Gift,
  MapPin,
  Minus,
  Plus,
  Search,
  Target,
  X,
  ZoomIn,
} from 'lucide-react';
import type { MapPin as MapPinType, PinCategory, Vehicle, ViewTab } from '../types';
import { categoryMeta } from '../utils';
import { AdSlot } from './AdSlot';
import { MAP_IMAGE_URL } from '../mockData';

interface MapViewProps {
  pins: MapPinType[];
  vehicles: Vehicle[];
  found: Record<string, boolean>;
  onToggleFound: (pinId: string) => void;
  globalSearch: string;
  onSelectVehicle: (id: string) => void;
  onSwitchTab: (tab: ViewTab) => void;
  focusPinId: string | null;
  onClearFocus: () => void;
}

const CATEGORIES: PinCategory[] = ['Free Car', 'Weapon', 'Collectible', 'Property', 'Activity'];

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function MapView({
  pins,
  vehicles,
  found,
  onToggleFound,
  globalSearch,
  onSelectVehicle,
  onSwitchTab,
  focusPinId,
  onClearFocus,
}: MapViewProps) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [activeCats, setActiveCats] = useState<Set<PinCategory>>(
    new Set(CATEGORIES),
  );
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MapPinType | null>(null);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const vehicleById = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const toggleCat = (c: PinCategory) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const query = (sidebarSearch || globalSearch).toLowerCase().trim();

  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (!activeCats.has(p.category)) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [pins, activeCats, query]);

  const visiblePinIds = useMemo(() => new Set(filteredPins.map((p) => p.pin_id)), [filteredPins]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    pins.forEach((p) => {
      c[p.category] = (c[p.category] ?? 0) + 1;
    });
    return c;
  }, [pins]);

  const foundCount = useMemo(() => pins.filter((p) => found[p.pin_id]).length, [pins, found]);
  const progress = pins.length ? Math.round((foundCount / pins.length) * 100) : 0;

  // Pan handlers
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  };
  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0015)));
  };

  const zoomBy = (d: number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + d)));

  // Focus a specific pin (from external navigation)
  const focusPin = useMemo(() => pins.find((p) => p.pin_id === focusPinId) ?? null, [pins, focusPinId]);
  const onCenterPin = useCallback(
    (pin: MapPinType) => {
      setZoom(2.2);
      // center the pin: pan so that the pin at (map_x%, map_y%) sits in the middle
      setPan({ x: -(pin.map_x - 50) * 4, y: -(pin.map_y - 50) * 4 });
      setSelected(pin);
    },
    [],
  );

  // Apply focus when focusPinId changes
  if (focusPin && (!selected || selected.pin_id !== focusPin.pin_id)) {
    onCenterPin(focusPin);
    onClearFocus();
  }

  const linkedVehicle = selected?.linked_car_id ? vehicleById.get(selected.linked_car_id) ?? null : null;

  return (
    <div
      className="flex w-full overflow-hidden border-t border-ink-700 bg-ink-950"
      style={{ height: 'calc(100vh - 56px - 41px)' }}
    >
      {/* Sidebar */}
      <aside className="flex w-[320px] shrink-0 flex-col border-r border-ink-600 bg-ink-900 md:flex">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search pins or regions..."
              className="w-full rounded-lg border border-ink-600 bg-ink-850 py-2 pl-9 pr-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-cyan-neon/60"
            />
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-200">
              Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((c) => {
                const meta = categoryMeta(c);
                const Icon = meta.icon;
                const on = activeCats.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                      on
                        ? 'border-ink-500 bg-ink-800 text-white'
                        : 'border-ink-700 bg-ink-850 text-ink-300 hover:bg-ink-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      {c}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold text-ink-100">
                        {counts[c] ?? 0}
                      </span>
                      <span
                        className={`h-3.5 w-3.5 rounded border transition ${
                          on ? 'border-cyan-neon bg-cyan-neon' : 'border-ink-500'
                        }`}
                      >
                        {on && <Check className="h-3 w-3 text-ink-950" strokeWidth={3} />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress tracker */}
          <div className="mb-4 rounded-xl border border-ink-600 bg-ink-850 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-200">
                Progress Tracker
              </h3>
              <span className="text-xs font-semibold text-cyan-neon">
                {foundCount} / {pins.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-neon to-cyan-neon transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-300">
              {progress}% of Leonida discovered. Mark pins as found to track your map completion.
            </p>
          </div>

          {/* Pin list */}
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-200">
              Pins ({filteredPins.length})
            </h3>
            <div className="flex flex-col gap-1">
              {filteredPins.slice(0, 24).map((p) => {
                const meta = categoryMeta(p.category);
                const Icon = meta.icon;
                const isFound = !!found[p.pin_id];
                return (
                  <button
                    key={p.pin_id}
                    onClick={() => onCenterPin(p)}
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-ink-800"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{p.title}</span>
                      <span className="block truncate text-[11px] text-ink-300">{p.region}</span>
                    </span>
                    {isFound && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                  </button>
                );
              })}
              {filteredPins.length === 0 && (
                <p className="rounded-lg bg-ink-850 px-3 py-4 text-center text-xs text-ink-300">
                  No pins match your filters.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom ad */}
        <div className="border-t border-ink-700 bg-ink-900 p-3">
          <AdSlot variant="rect" label="Sponsored" className="!mx-0" />
        </div>
      </aside>

      {/* Map canvas */}
      <div className="relative flex-1 overflow-hidden bg-ink-950">
        <div
          className="absolute inset-0 cursor-grab no-select"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 0.25s ease-out',
            }}
          >
            <div className="relative h-[68vh] w-[120vh] max-w-[1400px]">
              <img
                src={MAP_IMAGE_URL}
                alt="Leonida interactive map"
                className="absolute inset-0 h-full w-full rounded-lg object-cover shadow-[0_0_40px_rgba(0,0,0,0.6)]"
                draggable={false}
              />
              {/* grid overlay for map aesthetic */}
              <div
                className="absolute inset-0 rounded-lg opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,240,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              {/* neon border */}
              <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-cyan-neon/30" />

              {/* Pins */}
              {pins.map((p) => {
                if (!visiblePinIds.has(p.pin_id)) return null;
                const meta = categoryMeta(p.category);
                const Icon = meta.icon;
                const isFound = !!found[p.pin_id];
                const isSelected = selected?.pin_id === p.pin_id;
                return (
                  <button
                    key={p.pin_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(p);
                    }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.map_x}%`, top: `${p.map_y}%` }}
                    aria-label={p.title}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                        isSelected ? 'scale-125' : 'group-hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: isFound ? 'rgba(16,185,129,0.85)' : `${meta.color}cc`,
                        borderColor: isFound ? '#34d399' : meta.color,
                        boxShadow: `0 0 ${isSelected ? '16px' : '8px'} ${meta.color}`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </span>
                    {isFound && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-ink-950">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    {/* hover label */}
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-800/95 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-card ring-1 ring-ink-600 transition group-hover:opacity-100">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
          <button
            onClick={() => zoomBy(0.3)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-850/90 text-white backdrop-blur transition hover:bg-ink-700"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => zoomBy(-0.3)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-850/90 text-white backdrop-blur transition hover:bg-ink-700"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.2);
              setPan({ x: 0, y: 0 });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 bg-ink-850/90 text-white backdrop-blur transition hover:bg-ink-700"
            aria-label="Reset view"
          >
            <Target className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-850/90 px-3 py-1.5 text-xs text-ink-200 backdrop-blur">
          <ZoomIn className="h-3.5 w-3.5 text-cyan-neon" />
          {zoom.toFixed(1)}x
        </div>

        {/* Popover card */}
        {selected && (
          <div className="absolute left-1/2 top-4 z-30 w-[330px] max-w-[calc(100%-2rem)] -translate-x-1/2 animate-slideUp">
            <div className="rounded-xl border border-ink-600 bg-ink-800/95 p-4 shadow-card backdrop-blur-md">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const meta = categoryMeta(selected.category);
                      const Icon = meta.icon;
                      return (
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                        >
                          <Icon className="h-3 w-3" />
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-200">
                      {selected.category}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-display text-lg font-semibold text-white">
                    {selected.title}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-cyan-neon">
                    <MapPin className="h-3 w-3" />
                    {selected.region}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md p-1 text-ink-300 transition hover:bg-ink-700 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-3 text-sm leading-relaxed text-ink-100">{selected.description}</p>

              <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 text-sm transition hover:bg-ink-750">
                <input
                  type="checkbox"
                  checked={!!found[selected.pin_id]}
                  onChange={() => onToggleFound(selected.pin_id)}
                  className="h-4 w-4 accent-emerald-400"
                />
                <span className="flex-1 text-ink-100">Mark as Found</span>
                {found[selected.pin_id] && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </label>

              {linkedVehicle && (
                <button
                  onClick={() => {
                    setSelected(null);
                    onSelectVehicle(linkedVehicle.id);
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-pink-neon/20 to-cyan-neon/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-pink-neon/40 transition hover:from-pink-neon/30 hover:to-cyan-neon/30"
                >
                  <span>View Full Car Specs</span>
                  <ChevronRight className="h-4 w-4 text-pink-neon" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating bottom leaderboard ad */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
          <AdSlot variant="leaderboard" label="Sponsored" />
        </div>
      </div>
    </div>
  );
}
