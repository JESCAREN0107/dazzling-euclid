'use client';
import { useMemo, useState, type ReactNode } from 'react';

export interface FilterChip<T> {
  id: string;
  label: string;
  match: (item: T) => boolean;
}

export function ListToolbar<T>({
  items,
  searchText,
  placeholder = 'Buscar…',
  chips,
  right,
  emptyLabel = 'No hay resultados.',
  render,
}: {
  items: T[];
  searchText: (item: T) => string;
  placeholder?: string;
  chips?: FilterChip<T>[];
  right?: ReactNode;
  emptyLabel?: string;
  render: (filtered: T[]) => ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [chipId, setChipId] = useState<string>(chips?.[0]?.id ?? 'all');

  const counts = useMemo(() => {
    if (!chips) return {};
    const m: Record<string, number> = {};
    for (const c of chips) m[c.id] = items.filter(c.match).length;
    return m;
  }, [items, chips]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const activeChip = chips?.find((c) => c.id === chipId);
    return items.filter((it) => {
      if (activeChip && !activeChip.match(it)) return false;
      if (!q) return true;
      return searchText(it).toLowerCase().includes(q);
    });
  }, [items, query, chipId, chips, searchText]);

  return (
    <div>
      <div className="atoolbar">
        <input
          type="search"
          className="ainput atoolbar__search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {chips && chips.length > 0 && (
          <div className="atoolbar__chips" role="tablist">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={chipId === c.id}
                className={`achip${chipId === c.id ? ' is-active' : ''}`}
                onClick={() => setChipId(c.id)}
              >
                {c.label} <span>{counts[c.id] ?? 0}</span>
              </button>
            ))}
          </div>
        )}
        {right}
      </div>
      {filtered.length === 0 ? <p className="step__hint">{emptyLabel}</p> : render(filtered)}
    </div>
  );
}
