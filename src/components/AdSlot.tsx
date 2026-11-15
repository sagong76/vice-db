import { Megaphone } from 'lucide-react';
import { memo } from 'react';

interface AdSlotProps {
  variant: 'leaderboard' | 'rect' | 'native';
  className?: string;
  label?: string;
}

const SIZES: Record<AdSlotProps['variant'], { w: string; h: string; min: string }> = {
  leaderboard: { w: 'max-w-[728px]', h: 'h-[90px]', min: 'min-h-[90px]' },
  rect: { w: 'w-[300px]', h: 'h-[250px]', min: 'min-h-[250px]' },
  native: { w: 'w-full', h: 'h-[120px]', min: 'min-h-[120px]' },
};

function AdSlotBase({ variant, className = '', label }: AdSlotProps) {
  const size = SIZES[variant];
  return (
    <div
      className={`${size.w} ${size.h} ${size.min} mx-auto flex items-center justify-center rounded-lg border border-dashed border-ink-600 bg-ink-850/60 text-center ${className}`}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-1 px-3 text-ink-300">
        <Megaphone className="h-4 w-4 opacity-60" />
        <span className="text-[10px] uppercase tracking-widest opacity-70">
          {label ?? 'Advertisement'}
        </span>
        <span className="text-[9px] text-ink-400">{variant === 'rect' ? '300 × 250' : variant === 'leaderboard' ? '728 × 90' : 'Native In-Feed'}</span>
      </div>
    </div>
  );
}

export const AdSlot = memo(AdSlotBase);
