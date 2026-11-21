import { useMemo } from 'react';
import { AlertTriangle, BadgeCheck, ChevronRight, GitCompare, MapPinned } from 'lucide-react';
import type { MapPin, Vehicle } from '../types';
import { PIN_BY_ID, VEHICLES } from '../data';
import { classColor, displayName, formatPrice } from '../utils';
import { isPlainClick, vehiclePath } from '../router';
import { StatBar } from './StatBar';
import { VehicleImage } from './VehicleImage';
import { AdSlot } from './AdSlot';

interface VehiclePageProps {
  vehicle: Vehicle;
  navigate: (path: string) => void;
}

function rankOf(list: Vehicle[], v: Vehicle, key: 'price' | 'speed' | 'accel' | 'handling') {
  const sorted = [...list].sort((a, b) => b[key] - a[key]);
  return sorted.findIndex((x) => x.id === v.id) + 1;
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const m = n % 100;
  return n + (s[(m - 20) % 10] || s[m] || s[0]);
}

function buildFaq(v: Vehicle, pin: MapPin | undefined) {
  const name = displayName(v);
  const hedge = v.verified ? '' : ' (reported, not yet confirmed in-game)';
  const faqs: { q: string; a: string }[] = [];
  if (v.real_car) {
    faqs.push({
      q: `What real car is the ${name} based on?`,
      a: `The ${name} is modelled on the real-life ${v.real_car}. Like all GTA vehicles it uses a fictional brand (${v.manufacturer}) and an altered design, so details differ from the real car.`,
    });
  }
  faqs.push({
    q: `How much does the ${name} cost in GTA 6?`,
    a:
      v.price > 0
        ? `The listed price is ${formatPrice(v.price)}${hedge}.${
            v.free_spawn.toLowerCase() === 'yes' ? ' It can also be found as a free spawn, so you do not have to buy it.' : ''
          }`
        : `We have no purchase price for the ${name} yet.`,
  });
  faqs.push({
    q: `Where can I find the ${name} for free?`,
    a: pin
      ? `It is reported to spawn in ${pin.region}: ${pin.description}${pin.verified ? '' : ' This location has not been confirmed in-game yet.'} Open the interactive map to see the exact pin.`
      : `We do not have a free spawn location for the ${name}. If you have found one, tell us through the contact page.`,
  });
  return faqs;
}

export function VehiclePage({ vehicle: v, navigate }: VehiclePageProps) {
  const name = displayName(v);
  const colors = classColor(v.class);
  const pin = v.pin_id ? PIN_BY_ID.get(v.pin_id) : undefined;
  const isFree = v.free_spawn.toLowerCase() === 'yes';

  const { sameClass, similar, sameMaker } = useMemo(() => {
    const sameClass = VEHICLES.filter((x) => x.class === v.class);
    const similar = sameClass
      .filter((x) => x.id !== v.id)
      .sort((a, b) => Math.abs(a.price - v.price) - Math.abs(b.price - v.price))
      .slice(0, 4);
    const sameMaker = VEHICLES.filter((x) => x.manufacturer === v.manufacturer && x.id !== v.id).slice(0, 8);
    return { sameClass, similar, sameMaker };
  }, [v]);

  const faqs = useMemo(() => buildFaq(v, pin), [v, pin]);
  const compareIds = [v.id, ...similar.slice(0, 2).map((x) => x.id)].join(',');

  const link = (path: string) => ({
    href: path,
    onClick: (e: React.MouseEvent) => {
      if (!isPlainClick(e)) return;
      e.preventDefault();
      navigate(path);
    },
  });

  return (
    <article className="mx-auto max-w-5xl px-3 py-5 sm:px-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-ink-300">
        <a {...link('/')} className="hover:text-white">Home</a>
        <ChevronRight className="h-3 w-3" />
        <a {...link('/vehicles/')} className="hover:text-white">Vehicles</a>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-100">{name}</span>
      </nav>

      {/* Hero */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-600 bg-ink-850 sm:aspect-[21/9]">
        <VehicleImage vehicle={v} size="hero" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-md border ${colors.border} ${colors.bg} px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>
            {v.class}
          </span>
          {isFree && (
            <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Free Spawn
            </span>
          )}
        </div>
      </div>

      <header className="mt-4">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {name} <span className="text-ink-300">in GTA 6</span>
        </h1>
        {v.real_car && (
          <p className="mt-1 text-sm text-ink-100">
            Based on the <span className="text-cyan-neon">{v.real_car}</span>
          </p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs">
          {v.verified ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified{v.updated ? ` · updated ${v.updated}` : ''}
            </span>
          ) : (
            <span className="text-amber-400">Unverified{v.updated ? ` · updated ${v.updated}` : ''}</span>
          )}
        </p>
      </header>

      {!v.verified && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-ink-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Some details on this page come from trailers, previews and community reports and have not been
            confirmed in the released game yet. Price, stats and spawn location may change. We update the page
            as soon as we verify it in-game.
            {v.source_url && (
              <>
                {' '}Source:{' '}
                <a href={v.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-cyan-neon underline">
                  {v.source_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Overview */}
      <section className="mt-6">
        <h2 className="mb-2 font-display text-xl font-semibold text-white">Overview</h2>
        {v.description && <p className="mb-3 leading-relaxed text-ink-100">{v.description}</p>}
        <p className="leading-relaxed text-ink-100">
          The {name} is a {v.class.toLowerCase()} vehicle made by {v.manufacturer || 'an unknown manufacturer'}
          {v.real_car ? `, styled after the real-world ${v.real_car}` : ''}. Among the {sameClass.length}{' '}
          {v.class.toLowerCase()} vehicles in our database it ranks {ordinal(rankOf(sameClass, v, 'speed'))} for top
          speed, {ordinal(rankOf(sameClass, v, 'accel'))} for acceleration and{' '}
          {ordinal(rankOf(sameClass, v, 'price'))} by price.
          {isFree
            ? ' You do not need to buy it: it is listed as a free spawn on the map.'
            : ' It is not listed as a free spawn, so you will need to buy or steal one.'}
        </p>
      </section>

      <div className="my-6">
        <AdSlot variant="leaderboard" label="Advertisement" />
      </div>

      <section className="grid gap-5 md:grid-cols-2">
        {/* Specs table */}
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold text-white">Specs</h2>
          <div className="overflow-hidden rounded-xl border border-ink-600">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Manufacturer', v.manufacturer || '-'],
                  ['Class', v.class],
                  ['Real-life counterpart', v.real_car || '-'],
                  ['Price', v.price ? formatPrice(v.price) : '-'],
                  ['Free spawn', isFree ? `Yes${pin ? ` (${pin.region})` : ''}` : 'No'],
                  ['Status', v.verified ? 'Verified in-game' : 'Unverified'],
                ].map(([k, val], i) => (
                  <tr key={k} className={i % 2 ? 'bg-ink-850' : 'bg-ink-800'}>
                    <th scope="row" className="w-2/5 px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-wider text-ink-200">
                      {k}
                    </th>
                    <td className="px-4 py-2.5 font-medium text-white">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold text-white">Performance</h2>
          <div className="flex flex-col gap-3 rounded-xl border border-ink-600 bg-ink-850 p-4">
            <StatBar label="Top Speed" value={v.speed} />
            <StatBar label="Acceleration" value={v.accel} />
            <StatBar label="Handling" value={v.handling} />
            <p className="text-[11px] text-ink-300">
              {v.verified ? 'Ratings out of 100 from our in-game testing.' : 'Estimated ratings out of 100, not measured in-game yet.'}
            </p>
            <a
              {...link(`/compare/?ids=${compareIds}`)}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-neon to-pink-soft px-3 py-2.5 text-sm font-semibold text-white transition hover:shadow-neon-pink"
            >
              <GitCompare className="h-4 w-4" /> Compare with similar cars
            </a>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="mt-6">
        <h2 className="mb-2 font-display text-xl font-semibold text-white">Where to find the {name}</h2>
        {pin ? (
          <div className="rounded-xl border border-ink-600 bg-ink-850 p-4 text-ink-100">
            <p className="mb-1 font-semibold text-white">
              {pin.title} · {pin.region}
              {!pin.verified && <span className="ml-2 text-xs font-normal text-amber-400">unverified</span>}
            </p>
            <p className="mb-3 text-sm leading-relaxed">{pin.description}</p>
            <a
              {...link(`/?pin=${pin.pin_id}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-neon/50 bg-cyan-neon/10 px-3 py-2 text-sm font-semibold text-cyan-neon transition hover:bg-cyan-neon/20"
            >
              <MapPinned className="h-4 w-4" /> Show on the interactive map
            </a>
          </div>
        ) : (
          <p className="text-ink-100">
            No free spawn location is known for the {name} yet.
          </p>
        )}
      </section>

      {/* FAQ: visible text, not collapsed, so readers and crawlers see the answers */}
      <section className="mt-6">
        <h2 className="mb-2 font-display text-xl font-semibold text-white">FAQ</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-lg border border-ink-600 bg-ink-850/60 p-4">
              <h3 className="mb-1 font-semibold text-white">{f.q}</h3>
              <p className="text-sm leading-relaxed text-ink-100">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      {similar.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold text-white">Similar {v.class} vehicles</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {similar.map((s) => (
              <a key={s.id} {...link(vehiclePath(s.id))} className="group overflow-hidden rounded-xl border border-ink-600 bg-ink-800 transition hover:border-pink-neon/50">
                <div className="aspect-video overflow-hidden bg-ink-850">
                  <VehicleImage vehicle={s} size="thumb" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold text-white group-hover:text-pink-neon">{displayName(s)}</p>
                  <p className="text-xs text-ink-300">{s.price ? formatPrice(s.price) : s.class}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {sameMaker.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-display text-lg font-semibold text-white">More from {v.manufacturer}</h2>
          <ul className="flex flex-wrap gap-2">
            {sameMaker.map((s) => (
              <li key={s.id}>
                <a {...link(vehiclePath(s.id))} className="inline-block rounded-full border border-ink-600 bg-ink-850 px-3 py-1 text-sm text-ink-100 hover:border-cyan-neon/50 hover:text-white">
                  {displayName(s)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {v.image && v.image_credit && (
        <p className="mt-6 text-xs text-ink-300">Image: {v.image_credit}</p>
      )}
    </article>
  );
}
