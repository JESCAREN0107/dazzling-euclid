'use client';
import { useEffect, useState } from 'react';

export type ViewMode = 'cards' | 'rows';

export function useViewMode(scope: string, fallback: ViewMode = 'cards'): [ViewMode, (m: ViewMode) => void] {
  const key = `lumiere_admin_view_${scope}`;
  const [mode, setMode] = useState<ViewMode>(fallback);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'cards' || saved === 'rows') setMode(saved);
    } catch {
      /* ignore */
    }
  }, [key]);

  function update(next: ViewMode) {
    setMode(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      /* ignore */
    }
  }

  return [mode, update];
}
