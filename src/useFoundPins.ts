import { useCallback, useEffect, useState } from 'react';
import type { FoundState } from './types';

const KEY = 'vicedb.found';

function read(): FoundState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? (parsed as FoundState) : {};
  } catch {
    return {};
  }
}

export function useFoundPins() {
  const [found, setFound] = useState<FoundState>({});

  useEffect(() => {
    setFound(read());
  }, []);

  const toggle = useCallback((pinId: string) => {
    setFound((prev) => {
      const next = { ...prev, [pinId]: !prev[pinId] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const markFound = useCallback((pinId: string, value: boolean) => {
    setFound((prev) => {
      const next = { ...prev, [pinId]: value };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { found, toggle, markFound };
}
