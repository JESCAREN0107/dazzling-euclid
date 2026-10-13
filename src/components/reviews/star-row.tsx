'use client';
import { starString } from '@/lib/reviews';

export function StarRow({ rating, size }: { rating: number; size?: number }) {
  return (
    <span
      className="star-row"
      style={size ? { fontSize: size } : undefined}
      aria-label={`${Math.round(rating)} de 5 estrellas`}
    >
      {starString(rating)}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }} role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          style={{
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            fontSize: 18,
            color: n <= value ? 'var(--accent)' : 'var(--border)',
            padding: '2px 4px',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
