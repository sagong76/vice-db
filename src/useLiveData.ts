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

function parseNumber(val: unknown, fallback = 0): number {
  const cleaned = String(val ?? '').replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) && cleaned !== '' ? num : fallback;
}

function normalizeVehicle(row: Record<string, string>): Vehicle {
  return {
    id: String(row.id ?? '').trim(),
    name: String(row.name ?? '').trim(),
    manufacturer: String(row.manufacturer ?? '').trim(),
    class: (String(row.class ?? '').trim() || 'Sports') as Vehicle['class'],
    real_car: String(row.real_car ?? '').trim(),
    price: parseNumber(row.price, 0),
    speed: Math.min(100, Math.max(0, parseNumber(row.speed, 0))),
    accel: Math.min(100, Math.max(0, parseNumber(row.accel, 0))),
    handling: Math.min(100, Math.max(0, parseNumber(row.handling, 0))),
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
    map_x: Math.min(100, Math.max(0, parseNumber(row.map_x, 50))),
    map_y: Math.min(100, Math.max(0, parseNumber(row.map_y, 50))),
    description: String(row.description ?? '').trim(),
    linked_car_id: String(row.linked_car_id ?? '').trim(),
  };
}

async function fetchSheet(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
      const [vResult, pResult] = await Promise.allSettled([
        fetchSheet(VEHICLES_ENDPOINT),
        fetchSheet(PINS_ENDPOINT),
      ]);
      if (cancelled) return;

      const validVehicles =
        vResult.status === 'fulfilled'
          ? vResult.value.map(normalizeVehicle).filter((v) => v.id && v.name)
          : [];
      const validPins =
        pResult.status === 'fulfilled'
          ? pResult.value.map(normalizePin).filter((p) => p.pin_id && p.title)
          : [];

      if (validVehicles.length) setVehicles(validVehicles);
      if (validPins.length) setPins(validPins);

      if (!validVehicles.length && !validPins.length) {
        setUsingMock(true);
        setError('Live data unavailable - showing offline dataset.');
      } else {
        setUsingMock(false);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { vehicles, pins, loading, usingMock, error };
}
