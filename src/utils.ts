import {
  Car,
  Gift,
  Package,
  Shirt,
  Trophy,
  Zap,
  type LucideIcon,
  DollarSign,
} from 'lucide-react';
import type { PinCategory, VehicleClass } from './types';

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US');
  }
  return '$' + price;
}

export function classColor(cls: VehicleClass): { text: string; bg: string; border: string } {
  switch (cls) {
    case 'Super':
      return { text: 'text-pink-neon', bg: 'bg-pink-neon/10', border: 'border-pink-neon/40' };
    case 'Sports':
      return { text: 'text-cyan-neon', bg: 'bg-cyan-neon/10', border: 'border-cyan-neon/40' };
    case 'Muscle':
      return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/40' };
    case 'Boat':
      return { text: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/40' };
    case 'SUV':
      return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' };
    case 'Sedan':
      return { text: 'text-violet-300', bg: 'bg-violet-300/10', border: 'border-violet-300/40' };
    case 'Motorcycle':
      return { text: 'text-rose-300', bg: 'bg-rose-300/10', border: 'border-rose-300/40' };
    default:
      return { text: 'text-ink-100', bg: 'bg-white/5', border: 'border-ink-600' };
  }
}

export function categoryMeta(cat: PinCategory): { icon: LucideIcon; color: string; ring: string } {
  switch (cat) {
    case 'Free Car':
      return { icon: Gift, color: '#ff2a85', ring: 'shadow-neon-pink' };
    case 'Weapon':
      return { icon: Zap, color: '#ff5e3a', ring: 'shadow-[0_0_14px_rgba(255,94,58,0.5)]' };
    case 'Collectible':
      return { icon: Package, color: '#ffd23f', ring: 'shadow-[0_0_14px_rgba(255,210,63,0.5)]' };
    case 'Property':
      return { icon: Shirt, color: '#00f0ff', ring: 'shadow-neon-cyan' };
    case 'Activity':
      return { icon: Trophy, color: '#7bed9f', ring: 'shadow-[0_0_14px_rgba(123,237,159,0.5)]' };
    case 'Money Spot':
      return { color: '#10b981', icon: DollarSign };
    default:
      return { icon: Car, color: '#ffffff', ring: 'shadow-neon-cyan' };
  }
}

export function statColor(value: number): string {
  if (value >= 85) return 'from-pink-neon to-pink-soft';
  if (value >= 70) return 'from-cyan-neon to-cyan-soft';
  if (value >= 50) return 'from-amber-400 to-amber-300';
  return 'from-ink-400 to-ink-300';
}
