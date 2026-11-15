export type VehicleClass = 'Super' | 'Sports' | 'Muscle' | 'Boat' | 'SUV' | 'Sedan' | 'Motorcycle';

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
  image_url: string;
  description: string;
}

export type PinCategory = 'Free Car' | 'Weapon' | 'Collectible' | 'Property' | 'Activity';

export interface MapPin {
  pin_id: string;
  category: PinCategory;
  title: string;
  region: string;
  map_x: number; // percentage 0-100
  map_y: number; // percentage 0-100
  description: string;
  linked_car_id: string;
}

export type ViewTab = 'map' | 'vehicles' | 'compare';

export interface FoundState {
  [pinId: string]: boolean;
}
