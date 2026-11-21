export type VehicleClass = string;

export interface Vehicle {
  id: string;
  name: string;
  manufacturer: string;
  class: VehicleClass;
  real_car: string;
  price: number;
  speed: number; // 0-100
  accel: number; // 0-100
  handling: number; // 0-100
  free_spawn: 'Yes' | 'No' | string;
  pin_id: string;
  /** Local screenshot path (/images/vehicles/<id>.webp) or null when none exists yet. */
  image: string | null;
  image_credit: string;
  description: string;
  /** true only when confirmed in-game or from 2+ reliable sources. */
  verified: boolean;
  source_url: string;
  updated: string;
}

export type PinCategory = 'Free Car' | 'Weapon' | 'Collectible' | 'Property' | 'Activity' | 'Money Spot';

export interface MapPin {
  pin_id: string;
  category: PinCategory;
  title: string;
  region: string;
  map_x: number; // percentage 0-100
  map_y: number; // percentage 0-100
  description: string;
  linked_car_id: string;
  verified: boolean;
}

export type ViewTab = 'map' | 'vehicles' | 'compare';

export type Route =
  | { name: 'map' }
  | { name: 'vehicles' }
  | { name: 'compare' }
  | { name: 'vehicle'; id: string }
  | { name: 'notfound' };

export interface FoundState {
  [pinId: string]: boolean;
}
