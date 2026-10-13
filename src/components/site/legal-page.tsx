import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoIcon } from '../ui/logo-icon';

export type LegalSection = { id: string; heading: string; body: ReactNode };

export function LegalPage({
  kicker,
  title,
  lead,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="home legal" id="top">
      <header className="legal-top">
        <div className="legal-wrap legal-top__inner">
          <Link className="home-brand" href="/" aria-label="Lumière Skin & Spa inicio">
            <span className="home-brand__mark" aria-hidden="true">
              <LogoIcon />
            </span>
            <span className="home-brand__name">
              <b>Lumière Skin &amp; Spa</b>
              <small>Dermoestética · Tamaulipas</small>
            </span>
          </Link>
          <Link className="legal-back" href="/">
            <span aria-hidden="true">←</span> Volver al inicio
          </Link>
        </div>
      </header>

      <section className="legal-banner">
        <div className="legal-wrap">
          <span className="legal-kicker">{kicker}</span>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-lead">{lead}</p>
          <p className="legal-stamp">Última actualización: {updated}</p>
        </div>
      </section>

      <div className="legal-wrap legal-grid">
        <aside className="legal-rail">
          <nav className="legal-index" aria-label="En esta página">
            <p className="legal-index__label">Contenido</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="legal-index__n">{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-help">
            <p className="legal-help__h">¿Tienes dudas?</p>
            <p className="legal-help__p">
              Nuestro equipo de recepción está disponible para ayudarte con cualquier consulta sobre
              tus datos o reservaciones.
            </p>
            <a className="legal-help__call" href="tel:+528995276969">
              +52 899 527 6969
            </a>
            <span className="legal-help__sub">Martes a Sábado · 9:00 AM – 7:00 PM</span>
          </div>
        </aside>

        <main>
          {sections.map((s) => (
            <section className="legal-section" id={s.id} key={s.id}>
              <h2 className="legal-h">{s.heading}</h2>
              <div className="legal-prose">{s.body}</div>
            </section>
          ))}
        </main>
      </div>

      <footer className="legal-foot">
        <div className="legal-wrap legal-foot__inner">
          <span>© 2026 Lumière Skin &amp; Spa · Río Bravo / Reynosa, Tamaulipas</span>
          <span className="legal-foot__links">
            <Link href="/privacy">Privacidad</Link>
            <Link href="/terms">Términos</Link>
            <Link href="/">Inicio</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
