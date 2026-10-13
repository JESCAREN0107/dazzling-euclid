'use client';
import { useRouter } from 'next/navigation';

export function StylistPicker({
  stylists,
  selectedId,
  basePath = '/admin/schedule',
}: {
  stylists: { id: string; name: string }[];
  selectedId: string;
  basePath?: string;
}) {
  const router = useRouter();
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
      <span style={{ color: 'var(--muted)' }}>Especialista</span>
      <select
        className="ainput"
        value={selectedId}
        onChange={(e) => router.push(`${basePath}?stylist=${encodeURIComponent(e.target.value)}`)}
        aria-label="Seleccionar especialista"
      >
        {stylists.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
