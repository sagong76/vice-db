import { useEffect, useState } from 'react';
import type { MapPin, Vehicle } from './types';
import { MOCK_PINS, MOCK_VEHICLES, PINS_ENDPOINT, VEHICLES_ENDPOINT } from './mockData';

interface UseDataResult {
  vehicles: Vehicle[];
  pins: MapPin[];
  loading: boolean;
  usingMock: boolean;
  error: string | null;
}

function normalizeVehicle(row: Record<string, string>): Vehicle {
  return {
    id: String(row.id ?? '').trim(),
    name: String(row.name ?? '').trim(),
    manufacturer: String(row.manufacturer ?? '').trim(),
    class: (String(row.class ?? '').trim() || 'Sports') as Vehicle['class'],
    real_car: String(row.real_car ?? '').trim(),
    price: Number(row.price ?? 0) || 0,
    speed: Math.min(100, Math.max(0, Number(row.speed ?? 0) || 0)),
    accel: Math.min(100, Math.max(0, Number(row.accel ?? 0) || 0)),
    handling: Math.min(100, Math.max(0, Number(row.handling ?? 0) || 0)),
    free_spawn: String(row.free_spawn ?? '').trim() || 'No',
    pin_id: String(row.pin_id ?? '').trim(),
    image_url: String(row.image_url ?? '').trim(),
    description: String(row.description ?? '').trim(),
  };
}

function normalizePin(row: Record<string, string>): MapPin {
  return {
    pin_id: String(row.pin_id ?? '').trim(),
    category: (String(row.category ?? '').trim() || 'Free Car') as MapPin['category'],
    title: String(row.title ?? '').trim(),
    region: String(row.region ?? '').trim(),
    map_x: Math.min(100, Math.max(0, Number(row.map_x ?? 50) || 50)),
    map_y: Math.min(100, Math.max(0, Number(row.map_y ?? 50) || 50)),
    description: String(row.description ?? '').trim(),
    linked_car_id: String(row.linked_car_id ?? '').trim(),
  };
}

export function useLiveData(): UseDataResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [pins, setPins] = useState<MapPin[]>(MOCK_PINS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [vRes, pRes] = await Promise.all([
          fetch(VEHICLES_ENDPOINT).then((r) => r.json() as Promise<Record<string, string>[]>),
          fetch(PINS_ENDPOINT).then((r) => r.json() as Promise<Record<string, string>[]>),
        ]);
        if (cancelled) return;
        const validVehicles = Array.isArray(vRes) ? vRes.map(normalizeVehicle).filter((v) => v.id && v.name) : [];
        const validPins = Array.isArray(pRes) ? pRes.map(normalizePin).filter((p) => p.pin_id && p.title) : [];
        if (validVehicles.length) setVehicles(validVehicles);
        if (validPins.length) setPins(validPins);
        setUsingMock(!validVehicles.length && !validPins.length);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setUsingMock(true);
        setError('Live data unavailable - showing offline dataset.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { vehicles, pins, loading, usingMock, error };
}
