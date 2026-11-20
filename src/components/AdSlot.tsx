import { memo } from 'react';

interface AdSlotProps {
  variant: 'leaderboard' | 'rect' | 'native';
  className?: string;
  label?: string;
}

function AdSlotBase(props: AdSlotProps) {
  void props;
  return null;
}

export const AdSlot = memo(AdSlotBase);
