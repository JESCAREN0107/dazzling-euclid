'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LogoIcon } from '@/components/ui/logo-icon';

export function AuthShell({
  back,
  children,
}: {
  back: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__top">
          <Link href={back.href} className="auth__back">
            ← {back.label}
          </Link>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ThemeToggle />
          </div>
        </div>
        <div className="auth__body">{children}</div>
      </div>

      <aside className="auth__Showcase" aria-hidden="true">
        <div className="auth__brand">
          <span className="nav__mark">
            <LogoIcon />
          </span>
          <div>
            <b>Lumière Skin &amp; Spa</b>
            <span
              style={{
                display: 'block',
                fontSize: 11,
                color: 'var(--muted)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Clínica Facial · Río Bravo / Reynosa
            </span>
          </div>
        </div>
        <blockquote className="auth__quote">
          <div className="stars">★★★★★</div>
          <p>
            “Un santuario dermoestético donde cada tratamiento transforma la textura y luminosidad
            de mi piel desde la primera sesión.”
          </p>
          <footer>
            — Fernanda G. · <span>Clienta frecuente</span>
          </footer>
        </blockquote>
        <div className="auth__meta">
          <span>Mar–Sáb · 9 AM – 7 PM</span>
          <span>Dom · 10 AM – 3 PM</span>
          <span>Precios en MXN</span>
        </div>
      </aside>
    </div>
  );
}
