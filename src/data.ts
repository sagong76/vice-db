import type { MapPin, Vehicle } from './types';
import vehicleRows from './data/vehicles.json';
import pinRows from './data/pins.json';
import imageIds from './data/images.json';

// Data is baked in at build time by scripts/fetch-data.mjs (Google Sheet -> JSON).
// Sheet columns (Vehicles): id, name, manufacturer, class, real_car, price, speed, accel,
// handling, free_spawn, pin_id, description, [verified], [source_url], [image_credit], [updated]
// Sheet columns (Map_Pins): pin_id, category, title, region, map_x, map_y, description,
// linked_car_id, [verified]
// Columns in [brackets] are optional; when missing, the row is treated as unverified.

type Row = Record<string, string | undefined>;

const withImage = new Set<string>(imageIds as string[]);

function num(val: unknown, fallback = 0): number {
  const cleaned = String(val ?? '').replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) && cleaned !== '' ? n : fallback;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));
const str = (v: unknown) => String(v ?? '').trim();
const yes = (v: unknown) => /^(y|yes|true|1|✅|o)$/i.test(str(v));

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toVehicle(row: Row): Vehicle {
  const id = slugify(str(row.id) || str(row.name));
  return {
    id,
    name: str(row.name),
    manufacturer: str(row.manufacturer),
    class: str(row.class) || 'Sports',
    real_car: str(row.real_car),
    price: num(row.price),
    speed: clamp(num(row.speed)),
    accel: clamp(num(row.accel)),
    handling: clamp(num(row.handling)),
    free_spawn: str(row.free_spawn) || 'No',
    pin_id: str(row.pin_id),
    // Only our own screenshots are used. Stock photos of real cars (image_url column)
    // are deliberately ignored: they are not the in-game vehicle.
    image: withImage.has(id) ? `/images/vehicles/${id}.webp` : null,
    image_credit: str(row.image_credit),
    description: str(row.description),
    verified: yes(row.verified),
    source_url: str(row.source_url),
    updated: str(row.updated),
  };
}

function toPin(row: Row): MapPin {
  return {
    pin_id: str(row.pin_id),
    category: (str(row.category) || 'Free Car') as MapPin['category'],
    title: str(row.title),
    region: str(row.region),
    map_x: clamp(num(row.map_x, 50)),
    map_y: clamp(num(row.map_y, 50)),
    description: str(row.description),
    linked_car_id: slugify(str(row.linked_car_id)),
    verified: yes(row.verified),
  };
}

export const VEHICLES: Vehicle[] = (vehicleRows as Row[])
  .map(toVehicle)
  .filter((v) => v.id && v.name);

export const PINS: MapPin[] = (pinRows as Row[]).map(toPin).filter((p) => p.pin_id && p.title);

export const VEHICLE_BY_ID = new Map(VEHICLES.map((v) => [v.id, v]));
export const PIN_BY_ID = new Map(PINS.map((p) => [p.pin_id, p]));

/** Classes in the order they first appear, used for filter pills and class sections. */
export const CLASSES: string[] = [...new Set(VEHICLES.map((v) => v.class))];
