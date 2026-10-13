'use client';

import { useMemo, useState } from 'react';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';
import { useBooking } from '@/components/booking/booking-provider';
import type { Service, ServiceCategory } from '@/lib/supabase/types';

type TabCategory = 'all' | ServiceCategory;

const CATS: { id: TabCategory; label: string }[] = [
  { id: 'all', label: 'Todos los tratamientos' },
  { id: 'limpieza', label: 'Limpieza Profunda' },
  { id: 'hidratacion', label: 'Hidratación & Glow' },
  { id: 'antiedad', label: 'Rejuvenecimiento & Lifting' },
  { id: 'acne', label: 'Control Acné' },
  { id: 'paquetes', label: 'Rituales & Paquetes' },
];

function ServiceCard({ s }: { s: Service }) {
  const photo = servicePhoto(s);
  const { openBooking, enabled } = useBooking();

  return (
    <div className="home-scard">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="home-scard__photo"
        src={photo.type === 'img' ? photo.src : ''}
        data-fb={photo.type === 'img' ? (photo.fallbackSrc ?? '') : ''}
        alt={s.name}
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          const fb =
            el.dataset.fb ||
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85';
          if (!el.dataset.fallback && el.src !== fb) {
            el.dataset.fallback = '1';
            el.src = fb;
          }
        }}
      />
      <div className="home-scard__body">
        <div className="home-scard__top">
          <b className="home-scard__name">{s.name}</b>
          <span className="home-scard__price">{money(s.price_mxn)}</span>
        </div>
        {s.description && <p className="home-scard__desc">{s.description}</p>}
        {s.benefits && s.benefits.length > 0 && (
          <div className="home-member__tags" style={{ marginTop: 4 }}>
            {s.benefits.slice(0, 3).map((b) => (
              <span className="home-tag" key={b}>
                {b}
              </span>
            ))}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 'auto',
            paddingTop: 8,
          }}
        >
          <span className="home-scard__dur">⏱ {s.duration_min} min</span>
          {enabled && s.bookable && (
            <button
              type="button"
              className="btn btn--ghost"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
              onClick={() => openBooking(s.id)}
            >
              Reservar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ServicesTabs({
  services,
}: {
  services: Service[];
  featured?: Service | null;
}) {
  const [cat, setCat] = useState<TabCategory>('all');

  const list = useMemo(() => {
    if (cat === 'all') return services;
    return services.filter((s) => s.category === cat);
  }, [services, cat]);

  return (
    <div className="home-svc">
      <div className="home-svc__cats" role="tablist" aria-label="Categoría de tratamientos">
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={`home-svc__cat${cat === c.id ? ' is-on' : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="home-lead home-svc__empty">
          No hay tratamientos registrados en esta categoría por el momento.
        </p>
      ) : (
        <>
          <span className="home-swipe" aria-hidden="true">
            Desliza para ver más
          </span>
          <div className="home-svc__cards">
            {list.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
