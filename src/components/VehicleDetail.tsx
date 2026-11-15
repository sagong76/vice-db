import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  GitCompare,
  MapPinned,
  Plus,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type { MapPin as MapPinType, Vehicle } from '../types';
import { classColor, formatPrice } from '../utils';
import { StatBar } from './StatBar';
import { Modal } from './Modal';

interface VehicleDetailProps {
  vehicle: Vehicle;
  pin: MapPinType | null;
  open: boolean;
  onClose: () => void;
  onLocate: (pinId: string) => void;
  onAddToCompare: (id: string) => void;
  compareIds: string[];
}

interface FaqItem {
  q: string;
  a: string;
}

function buildFaq(v: Vehicle, pin: MapPinType | null): FaqItem[] {
  const faqs: FaqItem[] = [
    {
      q: `What is the ${v.manufacturer} ${v.name} based on in real life?`,
      a: `In GTA 6, the ${v.name} by ${v.manufacturer} is based on the real-life ${v.real_car}. Rockstar's in-game version faithfully adapts the design language and performance character of its real-world counterpart while fitting the Vice City aesthetic.`,
    },
    {
      q: `How much does the ${v.name} cost in GTA 6?`,
      a:
        v.price > 0
          ? `The ${v.manufacturer} ${v.name} costs ${formatPrice(v.price)} in GTA 6. ${
              v.free_spawn.toLowerCase() === 'yes'
                ? 'It can also be acquired for free at its spawn location, saving you the purchase price.'
                : 'It is not available as a free spawn, so it must be purchased outright.'
            }`
          : `The ${v.name} is not available for purchase through in-game dealers.`,
    },
    {
      q: `Where to find the ${v.name} for free in GTA 6?`,
      a: pin
        ? `You can find the ${v.name} for free in the ${pin.region} area of Leonida. Look for the pinned location marked "${pin.title}" on the interactive map. ${pin.description}`
        : `The ${v.name} does not have a confirmed free-spawn location on the map. It must be purchased from a dealer.`,
    },
    {
      q: `What are the performance stats of the ${v.name}?`,
      a: `The ${v.name} has a top speed rating of ${v.speed}/100, acceleration of ${v.accel}/100, and handling of ${v.handling}/100. It competes in the ${v.class} class alongside other high-performance vehicles in Leonida.`,
    },
  ];
  return faqs;
}

export function VehicleDetail({
  vehicle,
  pin,
  open,
  onClose,
  onLocate,
  onAddToCompare,
  compareIds,
}: VehicleDetailProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const colors = classColor(vehicle.class);
  const isFree = vehicle.free_spawn.toLowerCase() === 'yes';
  const inCompare = compareIds.includes(vehicle.id);

  const faqs = useMemo(() => buildFaq(vehicle, pin), [vehicle, pin]);

  useEffect(() => {
    if (open) {
      document.title = `${vehicle.manufacturer} ${vehicle.name} - GTA 6 Specs, Price & Location | VICE.DB`;
      setOpenFaq(0);
    } else {
      document.title = 'VICE.DB - GTA 6 Interactive Map & Vehicle Database';
    }
  }, [open, vehicle]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-4xl">
      {/* Hero image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-t-2xl bg-ink-850">
        <img
          src={vehicle.image_url}
          alt={`${vehicle.manufacturer} ${vehicle.name} in GTA 6 - inspired by ${vehicle.real_car}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/30 to-transparent" />
        <button
          onClick={onClose}
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-ink-900/80 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="absolute left-4 top-4 flex gap-1.5">
          <span className={`rounded-md border ${colors.border} ${colors.bg} px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>
            {vehicle.class}
          </span>
          {isFree && (
            <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Free Spawn
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-3xl font-bold text-white text-glow-pink">
            {vehicle.manufacturer} {vehicle.name}
          </h1>
          <p className="mt-1 text-sm text-ink-100">
            Based on the <span className="text-cyan-neon">{vehicle.real_car}</span>
          </p>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-5 sm:p-6">
        {/* Description */}
        <p className="mb-5 text-sm leading-relaxed text-ink-100">{vehicle.description}</p>

        {/* Quick specs summary table */}
        <section className="mb-6">
          <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-wider text-white">
            Quick Specs
          </h2>
          <div className="overflow-hidden rounded-xl border border-ink-600">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Manufacturer', vehicle.manufacturer],
                  ['Class', vehicle.class],
                  ['Real-Life Counterpart', vehicle.real_car],
                  ['Price', formatPrice(vehicle.price)],
                  ['Free Spawn', isFree ? 'Yes' : 'No'],
                ].map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? 'bg-ink-850' : 'bg-ink-800'}>
                    <th className="w-1/3 px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-wider text-ink-200">
                      {k}
                    </th>
                    <td className="px-4 py-2.5 font-medium text-white">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance + actions */}
        <section className="mb-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-600 bg-ink-850 p-4">
            <h2 className="mb-3 font-display text-base font-semibold uppercase tracking-wider text-white">
              Performance
            </h2>
            <div className="flex flex-col gap-3">
              <StatBar label="Top Speed" value={vehicle.speed} />
              <StatBar label="Acceleration" value={vehicle.accel} />
              <StatBar label="Handling" value={vehicle.handling} />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-ink-600 bg-ink-850 p-4">
            <h2 className="font-display text-base font-semibold uppercase tracking-wider text-white">
              Actions
            </h2>
            <button
              onClick={() => onAddToCompare(vehicle.id)}
              disabled={inCompare}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                inCompare
                  ? 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                  : 'bg-gradient-to-r from-pink-neon to-pink-soft text-white hover:shadow-neon-pink'
              }`}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {inCompare ? 'Added to Compare' : '+ Compare Car'}
            </button>
            {pin ? (
              <button
                onClick={() => {
                  onClose();
                  onLocate(pin.pin_id);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-cyan-neon/50 bg-cyan-neon/10 px-3 py-2.5 text-sm font-semibold text-cyan-neon transition hover:bg-cyan-neon/20"
              >
                <MapPinned className="h-4 w-4" />
                Locate on Interactive Map
              </button>
            ) : (
              <p className="rounded-lg border border-dashed border-ink-700 px-3 py-2.5 text-center text-xs text-ink-300">
                No free-spawn pin on the map for this vehicle.
              </p>
            )}
          </div>
        </section>

        {/* SEO FAQ */}
        <section>
          <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-wider text-white">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-2">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`overflow-hidden rounded-lg border transition ${
                    isOpen ? 'border-pink-neon/40 bg-ink-850' : 'border-ink-600 bg-ink-850/60'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-ink-800"
                    aria-expanded={isOpen}
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-pink-neon transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-sm leading-relaxed text-ink-100 animate-slideUp">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}
