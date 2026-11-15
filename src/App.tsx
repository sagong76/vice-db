import { useCallback, useMemo, useState } from 'react';
import type { ViewTab } from './types';
import { useLiveData } from './useLiveData';
import { useFoundPins } from './useFoundPins';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MapView } from './components/MapView';
import { VehicleDBView } from './components/VehicleDBView';
import { VehicleDetail } from './components/VehicleDetail';
import { CompareView } from './components/CompareView';
import { LegalModal, type LegalPage } from './components/LegalModal';

function App() {
  const { vehicles, pins, usingMock } = useLiveData();
  const { found, toggle } = useFoundPins();

  const [tab, setTab] = useState<ViewTab>('map');
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [focusPinId, setFocusPinId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);

  const pinById = useMemo(() => {
    const m = new Map<string, (typeof pins)[number]>();
    pins.forEach((p) => m.set(p.pin_id, p));
    return m;
  }, [pins]);

  const detailVehicle = useMemo(
    () => vehicles.find((v) => v.id === detailId) ?? null,
    [vehicles, detailId],
  );
  const detailPin = detailVehicle?.pin_id ? pinById.get(detailVehicle.pin_id) ?? null : null;

  const openSpecs = useCallback((id: string) => setDetailId(id), []);
  const closeSpecs = useCallback(() => setDetailId(null), []);

  const locatePin = useCallback(
    (pinId: string) => {
      setDetailId(null);
      setFocusPinId(pinId);
      setTab('map');
    },
    [],
  );

  const switchTab = useCallback((t: ViewTab) => setTab(t), []);

  const addToCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) return [prev[1], prev[2], id];
      return [...prev, id];
    });
  }, []);

  const setSlot = useCallback((index: number, id: string) => {
    setCompareIds((prev) => {
      const next = [...prev];
      while (next.length < 3) next.push('');
      // remove id from other slots first to avoid duplicates
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

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Header
        activeTab={tab}
        onTabChange={switchTab}
        search={search}
        onSearch={setSearch}
        usingMock={usingMock}
      />

      <main>
        {tab === 'map' && (
          <MapView
            pins={pins}
            vehicles={vehicles}
            found={found}
            onToggleFound={toggle}
            globalSearch={search}
            onSelectVehicle={openSpecs}
            onSwitchTab={switchTab}
            focusPinId={focusPinId}
            onClearFocus={() => setFocusPinId(null)}
          />
        )}
        {tab === 'vehicles' && (
          <VehicleDBView
            vehicles={vehicles}
            globalSearch={search}
            onOpenSpecs={openSpecs}
            onLocate={locatePin}
            onSwitchTab={switchTab}
          />
        )}
        {tab === 'compare' && (
          <CompareView
            vehicles={vehicles}
            compareIds={compareIds}
            onSetSlot={setSlot}
            onClearSlot={clearSlot}
            onOpenSpecs={openSpecs}
          />
        )}
      </main>

      <Footer onOpenLegal={setLegalPage} />

      {detailVehicle && (
        <VehicleDetail
          vehicle={detailVehicle}
          pin={detailPin}
          open={!!detailVehicle}
          onClose={closeSpecs}
          onLocate={locatePin}
          onAddToCompare={addToCompare}
          compareIds={compareIds}
        />
      )}

      <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />
    </div>
  );
}

export default App;
