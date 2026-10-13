'use client';
import { useMemo, useState, useTransition } from 'react';
import { setBookingStatus } from '@/app/admin/actions';

export interface BookingRow {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string;
  status: string;
}

const STATUSES = ['confirmed', 'completed', 'cancelled', 'no_show'] as const;
const STATUS_LABELS: Record<string, string> = {
  all: 'Todas',
  confirmed: 'Confirmadas',
  completed: 'Completadas',
  cancelled: 'Canceladas',
  no_show: 'Inasistencia',
};

export function BookingsTable({ rows, emptyLabel }: { rows: BookingRow[]; emptyLabel: string }) {
  const [pending, start] = useTransition();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) m[s] = 0;
    for (const r of rows) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${b.reference} ${b.customerName} ${b.customerPhone} ${b.serviceName} ${b.stylistName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  if (rows.length === 0) {
    return <p className="step__hint">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="atoolbar">
        <input
          type="search"
          className="ainput atoolbar__search"
          placeholder="Buscar cliente, teléfono, tratamiento, especialista o código…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="atoolbar__chips" role="tablist">
          {(['all', ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={statusFilter === s}
              className={`achip${statusFilter === s ? ' is-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s] ?? s} <span>{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="step__hint">Ninguna cita coincide con los filtros.</p>
      ) : (
        <div className="atable-wrap">
          <table className="atable">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha y hora</th>
                <th>Cliente</th>
                <th>Tratamiento</th>
                <th>Especialista</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)' }}>
                    {b.reference}
                  </td>
                  <td>{b.whenLabel}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.customerPhone}</div>
                  </td>
                  <td>{b.serviceName}</td>
                  <td>{b.stylistName}</td>
                  <td>
                    <select
                      aria-label={`Estado de ${b.reference}`}
                      defaultValue={b.status}
                      disabled={pending}
                      onChange={(e) => start(() => setBookingStatus(b.id, e.target.value))}
                      className="aselect"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s] ?? s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
