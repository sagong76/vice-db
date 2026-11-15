import { memo } from 'react';
import { statColor } from '../utils';

interface StatBarProps {
  label: string;
  value: number; // 0-100
  showValue?: boolean;
}

function StatBarBase({ label, value, showValue = true }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-200">
        <span>{label}</span>
        {showValue && <span className="font-semibold text-ink-100">{pct}</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${statColor(pct)} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export const StatBar = memo(StatBarBase);
