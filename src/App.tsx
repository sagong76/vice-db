import { useCallback, useEffect, useState } from 'react';
import type { ViewTab } from './types';
import { PINS, VEHICLES, VEHICLE_BY_ID } from './data';
import { useFoundPins } from './useFoundPins';
import { isPlainClick, useRouter, vehiclePath } from './router';
import { applyMeta, metaFor } from './seo';
import { displayName } from './utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MapView } from './components/MapView';
import { VehicleDBView } from './components/VehicleDBView';
import { VehiclePage } from './components/VehiclePage';
import { CompareView } from './components/CompareView';

const TAB_PATHS: Record<ViewTab, string> = { map: '/', vehicles: '/vehicles/', compare: '/compare/' };

function App({ initialPath }: { initialPath: string }) {
  const { found, toggle } = useFoundPins();
  const { route, navigate } = useRouter(initialPath);

  const [search, setSearch] = useState('');
  const [focusPinId, setFocusPinId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Query params (?pin=, ?ids=) are read after hydration so the prerendered HTML matches.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (route.name === 'map' && q.get('pin')) setFocusPinId(q.get('pin'));
    if (route.name === 'compare' && q.get('ids')) {
      setCompareIds(q.get('ids')!.split(',').filter((id) => VEHICLE_BY_ID.has(id)).slice(0, 3));
    }
    applyMeta(metaFor(route));
  }, [route]);

  const activeTab: ViewTab | null =
    route.name === 'map' ? 'map' : route.name === 'compare' ? 'compare' : route.name === 'notfound' ? null : 'vehicles';

  const switchTab = useCallback((t: ViewTab) => navigate(TAB_PATHS[t]), [navigate]);
  const openVehicle = useCallback((id: string) => navigate(vehiclePath(id)), [navigate]);

  const onSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (q && route.name === 'vehicle') navigate('/vehicles/');
    },
    [navigate, route.name],
  );

  const setSlot = useCallback((index: number, id: string) => {
    setCompareIds((prev) => {
      const next = [...prev];
      while (next.length < 3) next.push('');
      for (let i = 0; i < next.length; i++) if (next[i] === id) next[i] = '';
      next[index] = id;
      return next;
    });
  }, []);

  const clearSlot = useCallback((index: number) => {
    setCompareIds((prev) => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  }, []);

  const freeCars = PINS.filter((p) => p.category === 'Free Car' && VEHICLE_BY_ID.has(p.linked_car_id));

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Header activeTab={activeTab} onTabChange={switchTab} search={search} onSearch={onSearch} />

      <main>
        {route.name === 'map' && (
          <>
            <MapView
              pins={PINS}
              vehicles={VEHICLES}
              found={found}
              onToggleFound={toggle}
              globalSearch={search}
              onSelectVehicle={openVehicle}
              onSwitchTab={switchTab}
              focusPinId={focusPinId}
              onClearFocus={() => setFocusPinId(null)}
            />
            {/* Crawlable text under the map: the map itself is an image with JS pins. */}
            <section className="mx-auto max-w-5xl px-3 py-8 sm:px-5">
              <h1 className="font-display text-2xl font-bold text-white">GTA 6 Interactive Map of Leonida</h1>
              <p className="mt-2 leading-relaxed text-ink-100">
                Find free car spawns, weapons, collectibles and money spots across Vice City and the rest of
                Leonida. Tick pins as found to track your progress; it is saved in your browser. Locations marked
                unverified come from early reports and are checked in-game as we play.
              </p>
              {freeCars.length > 0 && (
                <>
                  <h2 className="mt-6 font-display text-xl font-semibold text-white">
                    Free car spawn locations ({freeCars.length})
                  </h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {freeCars.map((p) => {
                      const v = VEHICLE_BY_ID.get(p.linked_car_id)!;
                      return (
                        <li key={p.pin_id} className="rounded-lg border border-ink-600 bg-ink-850 p-3 text-sm">
                          <a
                            href={vehiclePath(v.id)}
                            onClick={(e) => {
                              if (!isPlainClick(e)) return;
                              e.preventDefault();
                              openVehicle(v.id);
                            }}
                            className="font-semibold text-white hover:text-pink-neon"
                          >
                            {displayName(v)}
                          </a>
                          <span className="text-ink-300"> · {p.region}</span>
                          <p className="mt-1 text-ink-200">{p.description}</p>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          </>
        )}
        {route.name === 'vehicles' && (
          <VehicleDBView vehicles={VEHICLES} globalSearch={search} navigate={navigate} />
        )}
        {route.name === 'vehicle' && (
          <VehiclePage key={route.id} vehicle={VEHICLE_BY_ID.get(route.id)!} navigate={navigate} />
        )}
        {route.name === 'compare' && (
          <CompareView
            vehicles={VEHICLES}
            compareIds={compareIds}
            onSetSlot={setSlot}
            onClearSlot={clearSlot}
            navigate={navigate}
          />
        )}
        {route.name === 'notfound' && (
          <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <h1 className="font-display text-3xl font-bold text-white">Page not found</h1>
            <p className="mt-2 text-ink-200">This page does not exist or the vehicle was renamed.</p>
            <a href="/vehicles/" className="mt-6 inline-block rounded-lg bg-pink-neon px-4 py-2 font-semibold text-white">
              Browse all vehicles
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
