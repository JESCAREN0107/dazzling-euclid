export interface StatTile {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="astats">
      {tiles.map((t) => (
        <div key={t.label} className={`astat${t.accent ? ' astat--accent' : ''}`}>
          <div className="astat__label">{t.label}</div>
          <div className="astat__value">{t.value}</div>
          {t.hint && <div className="astat__hint">{t.hint}</div>}
        </div>
      ))}
    </div>
  );
}
