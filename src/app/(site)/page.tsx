import { BookingProvider } from '@/components/booking/booking-provider';
import { AccountModalsProvider } from '@/components/account/account-modals';
import { BookButton } from '@/components/site/book-button';
import { Faq } from '@/components/home/faq';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NavAuth } from '@/components/site/nav-auth';
import { LiveStatus } from '@/components/site/live-status';
import { ImgSlot } from '@/components/site/img-slot';
import { ServicesTabs } from '@/components/home/services-tabs';
import { HomeEffects } from '@/components/home/home-effects';
import { BottomNav } from '@/components/home/bottom-nav';
import { WhatsAppFab } from '@/components/home/whatsapp-fab';
import { minutesToLabel } from '@/lib/format';
import { ratingLabel, stylistAvatarSrc } from '@/lib/stylist-card';
import { getSiteContent } from '@/lib/content/get';
import { getProfile } from '@/lib/supabase/auth';
import { avatarSrc } from '@/lib/avatar';
import { createClient } from '@/lib/supabase/server';
import { LogoIcon } from '@/components/ui/logo-icon';
import { SPA_TZ } from '@/lib/time';
import {
  getBookableServices,
  getGallery,
  getStylists,
  getRecentReviews,
  getBusinessHours,
} from '@/lib/queries';

const NAV_LINKS = [
  { href: '#about', label: 'Filosofía' },
  { href: '#services', label: 'Tratamientos' },
  { href: '#how', label: 'Experiencia' },
  { href: '#looks', label: 'Galería' },
  { href: '#team', label: 'Especialistas' },
  { href: '#reviews', label: 'Reseñas' },
  { href: '#faq', label: 'Preguntas' },
  { href: '#visit', label: 'Ubicación' },
];

const STRIP = [
  'Hidrodermoabrasión',
  'Glow HidraFacial 3 en 1',
  'Dermaplaning + Oro 24K',
  'Control Anti-Acné',
  'Lifting con Radiofrecuencia',
  'Rituales Botánicos',
  'Diagnóstico Dermoestético',
  'Cabina Sensorial Privada',
];

const STEPS = [
  {
    h: 'Reserva tu horario',
    p: 'Elige tu tratamiento facial, especialista preferida, fecha y horario disponible en línea en menos de un minuto.',
  },
  {
    h: 'Diagnóstico dermoestético',
    p: 'Evaluamos las necesidades reales de tu piel para personalizar los activos clínicos de tu sesión.',
  },
  {
    h: 'Ritual en cabina privada',
    p: 'Relájate con aromaterapia botánica, vapor de ozono y aparatología no invasiva de grado médico.',
  },
  {
    h: 'Luminosidad y seguimiento',
    p: 'Aplicamos fotoprotección clínica y te entregamos recomendaciones personalizadas para cuidar tu piel en casa.',
  },
];

const DAYS = [
  { dow: 1, label: 'Lunes' },
  { dow: 2, label: 'Martes' },
  { dow: 3, label: 'Miércoles' },
  { dow: 4, label: 'Jueves' },
  { dow: 5, label: 'Viernes' },
  { dow: 6, label: 'Sábado' },
  { dow: 0, label: 'Domingo' },
];

const reviewDate = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const sp = await searchParams;
  const deleted = sp.deleted === '1';

  const [services, stylists, gallery, reviews, hours, hero, story, stats, cta, contact, faqs, profile] =
    await Promise.all([
      getBookableServices(),
      getStylists(),
      getGallery(),
      getRecentReviews(),
      getBusinessHours(),
      getSiteContent('hero'),
      getSiteContent('story'),
      getSiteContent('stats'),
      getSiteContent('cta'),
      getSiteContent('contact'),
      getSiteContent('faqs'),
      getProfile(),
    ]);

  let userMetadata: Record<string, unknown> | null = null;
  let hasPassword = false;
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    userMetadata = user?.user_metadata ?? null;
    hasPassword =
      (user?.identities ?? []).some((i) => i.provider === 'email') ||
      user?.user_metadata?.has_password === true;
  } catch {
    userMetadata = null;
  }

  const looks = gallery.slice(0, 6);
  const isCustomer = profile?.role !== 'admin' && profile?.role !== 'staff';
  const hoursByDow = new Map(hours.map((h) => [h.day_of_week, h]));

  const accountHref = !profile
    ? '/login'
    : profile.role === 'admin'
      ? '/admin'
      : profile.role === 'staff'
        ? '/staff'
        : null;
  const accountLabel =
    profile?.role === 'staff'
      ? 'Agenda'
      : profile?.role === 'admin'
        ? 'Admin'
        : 'Mi Cuenta';
  const accountAvatar = profile
    ? avatarSrc(userMetadata, profile.email ?? profile.fullName ?? 'guest')
    : null;

  const statCards = [stats.s1, stats.s2, stats.s3, stats.s4];

  return (
    <BookingProvider
      services={services}
      stylists={stylists}
      hours={hours}
      enabled={isCustomer}
      prefill={
        profile
          ? {
              name: profile.fullName ?? '',
              phone: profile.phone ?? '',
              email: profile.email ?? '',
            }
          : null
      }
    >
      <AccountModalsProvider
        profile={profile}
        userMetadata={userMetadata}
        hasPassword={hasPassword}
      >
        <div className="home" id="top">
          <HomeEffects />

          {deleted && (
            <div
              role="status"
              style={{
                background: 'var(--accent-tint)',
                color: 'var(--fg)',
                textAlign: 'center',
                padding: '12px 16px',
                fontSize: 14,
              }}
            >
              Tu cuenta y datos personales han sido eliminados. Gracias por visitar Lumière Skin &amp; Spa.
            </div>
          )}

          {/* ── header ── */}
          <header className="home-header">
            <div className="home-wrap home-header__inner">
              <a className="home-brand" href="#top" aria-label="Lumière Skin & Spa inicio">
                <span className="home-brand__mark" aria-hidden="true">
                  <LogoIcon />
                </span>
                <span className="home-brand__name">
                  <b>Lumière Skin &amp; Spa</b>
                  <small>Clínica Dermoestética · Río Bravo / Reynosa</small>
                </span>
              </a>

              <nav className="home-nav" aria-label="Navegación principal">
                {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </nav>

              <div className="home-header__actions">
                <ThemeToggle />
                <NavAuth profile={profile} userMetadata={userMetadata} />
                <BookButton variant="primary" className="home-header__book">
                  {hero.cta_primary}
                </BookButton>
              </div>
            </div>
          </header>

          <main>
            {/* ── hero ── */}
            <section className="home-hero">
              <div className="home-wrap home-hero__grid">
                <div className="home-reveal">
                  <span className="home-eyebrow">{hero.eyebrow}</span>
                  <h1 className="home-hero__display">
                    <span className="ln">{hero.title_line1}</span>
                    <span className="ln">
                      <em>{hero.title_accent}</em>
                    </span>
                    <span className="ln">{hero.title_line2}</span>
                  </h1>
                  <p className="home-hero__lead">{hero.lead}</p>
                  <div className="home-hero__actions">
                    <BookButton variant="primary">{hero.cta_primary}</BookButton>
                    <a className="home-link" href="#services">
                      {hero.cta_secondary} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                  <dl className="home-hero__facts">
                    <div>
                      <dt>Especialidad</dt>
                      <dd>Dermoestética Clínica</dd>
                    </div>
                    <div>
                      <dt>Horario</dt>
                      <dd>Mar–Sáb 9 AM – 7 PM</dd>
                    </div>
                    <div>
                      <dt>Moneda</dt>
                      <dd>Pesos (MXN)</dd>
                    </div>
                  </dl>
                </div>

                <div className="home-hero__media home-reveal">
                  <span className="home-hero__pole" aria-hidden="true" />
                  <div className="home-hero__frame">
                    <ImgSlot
                      src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85"
                      alt="Cabina dermoestética Lumière Skin & Spa"
                      priority={true}
                      sizes="(max-width: 980px) 100vw, 50vw"
                    />
                  </div>
                  <div className="home-hero__badge">
                    <span className="home-dot" aria-hidden="true" />
                    <span>
                      <b>Reserva en línea con confirmación inmediata</b>
                      <span style={{ display: 'block' }}>
                        Protección automática contra citas duplicadas
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── trust strip ── */}
            <div className="home-strip" aria-hidden="true">
              <div className="home-strip__track">
                <span>
                  {STRIP.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </span>
                <span>
                  {STRIP.map((s) => (
                    <span key={`b-${s}`}>{s}</span>
                  ))}
                </span>
              </div>
            </div>

            {/* ── story / about ── */}
            <section className="home-section home-story" id="about">
              <div className="home-wrap home-story__grid">
                <div className="home-story__art home-reveal">
                  <ImgSlot
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85"
                    alt="Interior de Lumière Skin & Spa"
                    sizes="(max-width: 980px) 100vw, 50vw"
                  />
                </div>
                <div className="home-reveal">
                  <span className="home-eyebrow">{story.eyebrow}</span>
                  <h2 className="home-h">{story.heading}</h2>
                  <p>{story.body1}</p>
                  <p>{story.body2}</p>
                  <div className="home-story__stats">
                    {statCards.slice(0, 3).map((c, i) => (
                      <div key={i}>
                        <b>{c.n}</b>
                        <span>{c.l}</span>
                      </div>
                    ))}
                  </div>
                  <p className="home-story__sign">“{story.quote}”</p>
                </div>
              </div>
            </section>

            {/* ── services / pricing ── */}
            <section className="home-section" id="services">
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">Catálogo Clínico</span>
                  <h2 className="home-h">
                    Tratamientos &amp; <em>precios</em>
                  </h2>
                  <p className="home-lead">
                    Protocolos faciales personalizados con activos de grado dermatológico. Todos
                    nuestros precios están expresados en Pesos Mexicanos (MXN) e incluyen valoración
                    inicial.
                  </p>
                </div>
                <div className="home-reveal">
                  <ServicesTabs services={services} />
                </div>
              </div>
            </section>

            {/* ── how it works ── */}
            <section className="home-section home-how" id="how">
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">Tu experiencia</span>
                  <h2 className="home-h">Tu visita, paso a paso</h2>
                  <p className="home-lead">
                    Desde tu reserva en línea hasta el cuidado posterior en casa: así cuidamos tu
                    piel en cada sesión.
                  </p>
                  <span className="home-swipe" aria-hidden="true">
                    desliza
                  </span>
                </div>
                <div className="home-steps home-car">
                  {STEPS.map((s) => (
                    <div className="home-step home-reveal" key={s.h}>
                      <div className="home-step__n" aria-hidden="true" />
                      <h3>{s.h}</h3>
                      <p>{s.p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── gallery / lookbook ── */}
            {looks.length > 0 && (
              <section className="home-section" id="looks" style={{ background: 'transparent' }}>
                <div className="home-wrap">
                  <div className="home-head home-reveal">
                    <span className="home-eyebrow home-eyebrow--center">Nuestro santuario</span>
                    <h2 className="home-h">Galería clínica &amp; sensorial</h2>
                    <p className="home-lead">
                      Conoce nuestras cabinas privadas, aparatología facial y rituales botánicos.
                    </p>
                    <span className="home-swipe" aria-hidden="true">
                      desliza
                    </span>
                  </div>
                  <div className="home-look home-car">
                    {looks.map((item) => (
                      <article className="home-look__item home-reveal" key={item.id}>
                        <ImgSlot src={item.image_url} alt={item.title} />
                        <span className="home-look__tag">{item.tag}</span>
                        <div className="home-look__grad" />
                        <div className="home-look__cap">
                          <b>{item.title}</b>
                          <span>{item.category}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── team / specialists ── */}
            {stylists.length > 0 && (
              <section className="home-section" id="team">
                <div className="home-wrap">
                  <div className="home-head home-reveal">
                    <span className="home-eyebrow home-eyebrow--center">Equipo clínico</span>
                    <h2 className="home-h">Conoce a nuestras especialistas</h2>
                    <p className="home-lead">
                      Cosmiatras y terapeutas faciales certificadas dedicadas a la salud y estética
                      de tu piel.
                    </p>
                    <span className="home-swipe" aria-hidden="true">
                      desliza
                    </span>
                  </div>
                  <div className="home-team home-car home-car--narrow">
                    {stylists.map((s) => {
                      const rating = ratingLabel(s.rating, s.rating_count);
                      return (
                        <article className="home-member home-reveal" key={s.id}>
                          <div className="home-member__photo">
                            <ImgSlot src={stylistAvatarSrc(s)} alt={s.name} />
                          </div>
                          <h3>{s.name}</h3>
                          <div className="home-member__role">{s.role}</div>
                          <div className="home-member__rating">
                            {rating.stars}
                            {rating.reviews ? ` ${rating.reviews}` : ''}
                          </div>
                          {s.tags.length > 0 && (
                            <div className="home-member__tags">
                              {s.tags.slice(0, 3).map((tag) => (
                                <span className="home-tag" key={tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* ── reviews ── */}
            {reviews.length > 0 && (
              <section className="home-section" id="reviews" style={{ background: 'transparent' }}>
                <div className="home-wrap">
                  <div className="home-head home-reveal">
                    <span className="home-eyebrow home-eyebrow--center">Experiencias reales</span>
                    <h2 className="home-h">Lo que dicen nuestras clientas</h2>
                    <span className="home-swipe" aria-hidden="true">
                      desliza
                    </span>
                  </div>
                  <div className="home-reviews__grid home-car">
                    {reviews.slice(0, 6).map((r) => (
                      <article className="home-card home-review home-reveal" key={r.id}>
                        <div className="home-review__stars" aria-label={`${r.rating} de 5`}>
                          {'★'.repeat(r.rating)}
                        </div>
                        {r.comment && <p>&ldquo;{r.comment}&rdquo;</p>}
                        <div className="home-review__foot">
                          <div className="home-review__by">
                            <b>{r.customer_name}</b>
                            {r.stylistName && <span>con {r.stylistName}</span>}
                          </div>
                          <span className="home-review__date">
                            {reviewDate.format(new Date(r.created_at))}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── faq ── */}
            <section className="home-section" id="faq">
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">Información útil</span>
                  <h2 className="home-h">Preguntas frecuentes</h2>
                </div>
                <div className="home-reveal">
                  <Faq items={faqs.items} />
                </div>
              </div>
            </section>

            {/* ── visit ── */}
            <section className="home-section home-visit" id="visit">
              <div className="home-wrap">
                <div className="home-visit__grid">
                  <div className="home-reveal">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                      }}
                    >
                      <div>
                        <span className="home-eyebrow">Visítanos</span>
                        <h2 className="home-h">Ubicación y horarios</h2>
                      </div>
                      <LiveStatus hours={hours} />
                    </div>

                    <ul
                      className="home-hours home-card"
                      style={{ padding: '8px 22px', marginTop: 22 }}
                    >
                      {DAYS.map(({ dow, label }) => {
                        const h = hoursByDow.get(dow);
                        const closed = !h || h.is_closed;
                        return (
                          <li key={dow}>
                            <span className="day">{label}</span>
                            <span className={closed ? 'closed' : 'time'}>
                              {closed
                                ? 'Cerrado'
                                : `${minutesToLabel(h!.open_minute)} – ${minutesToLabel(h!.close_minute)}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="home-info">
                      <div className="home-card home-info__card">
                        <div className="k">Dirección</div>
                        <div className="v">{contact.address}</div>
                      </div>
                      <div className="home-card home-info__card">
                        <div className="k">Referencias</div>
                        <div className="v">{contact.landmark}</div>
                      </div>
                      <div className="home-card home-info__card">
                        <div className="k">Teléfono / WhatsApp</div>
                        <div className="v">{contact.phone}</div>
                      </div>
                      <div className="home-card home-info__card">
                        <div className="k">Correo electrónico</div>
                        <div className="v">{contact.email}</div>
                      </div>
                    </div>

                    <div className="home-visit__actions">
                      <BookButton variant="primary">Agendar cita</BookButton>
                      <a
                        href={contact.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="home-btn home-btn--ghost"
                      >
                        Cómo llegar (Google Maps)
                      </a>
                      {contact.instagram && (
                        <a
                          href={contact.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="home-btn home-btn--ghost"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="home-visit__map home-reveal">
                    <iframe
                      src="https://www.google.com/maps?q=25.983294863816297,-98.10022678386305&z=16&output=embed"
                      title={`Mapa de ubicación de ${contact.address}`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── CTA ── */}
            <section className="home-section home-cta">
              <span className="home-cta__glow" aria-hidden="true" />
              <div className="home-wrap home-cta__inner home-reveal">
                <h2>{cta.heading}</h2>
                <p>{cta.sub}</p>
                <div className="home-cta__actions">
                  <BookButton variant="primary">{cta.button}</BookButton>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="home-btn home-btn--light"
                  >
                    Llamar al {contact.phone}
                  </a>
                </div>
              </div>
            </section>
          </main>

          {/* ── footer ── */}
          <footer className="home-foot">
            <div className="home-wrap">
              <div className="home-foot__grid">
                <div className="home-foot__brand">
                  <a className="home-brand" href="#top" aria-label="Lumière Skin & Spa inicio">
                    <span className="home-brand__mark" aria-hidden="true">
                      <LogoIcon />
                    </span>
                    <span className="home-brand__name">
                      <b>Lumière Skin &amp; Spa</b>
                      <small>Clínica Dermoestética · Río Bravo / Reynosa</small>
                    </span>
                  </a>
                  <p>
                    Dermoestética clínica, hidrodermoabrasión y rituales faciales personalizados en
                    Río Bravo / Reynosa, Tamaulipas. Zona horaria {SPA_TZ}.
                  </p>
                </div>
                <div>
                  <h5>Explorar</h5>
                  <ul>
                    {NAV_LINKS.map((l) => (
                      <li key={l.href}>
                        <a href={l.href}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5>Horarios</h5>
                  <ul>
                    <li>Martes a Sábado: 9:00 AM – 7:00 PM</li>
                    <li>Domingo: 10:00 AM – 3:00 PM</li>
                    <li style={{ color: 'var(--accent-text)' }}>Lunes cerrado · Cita previa</li>
                  </ul>
                </div>
                <div>
                  <h5>Contacto</h5>
                  <ul>
                    <li>
                      <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a>
                    </li>
                    <li>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </li>
                    <li>{contact.address}</li>
                  </ul>
                </div>
              </div>
              <div className="home-foot__bottom">
                <span>
                  © {new Date().getFullYear()} Lumière Skin &amp; Spa. Todos los derechos reservados.
                </span>
                <span className="home-foot__legal">
                  <a href="/privacy">Aviso de Privacidad</a>
                  <a href="/terms">Términos y Condiciones</a>
                </span>
              </div>
            </div>
          </footer>

          <WhatsAppFab phone={contact.phone} />

          <BottomNav
            signedIn={!!profile}
            accountHref={accountHref}
            accountLabel={accountLabel}
            avatarSrc={accountAvatar}
          />
        </div>
      </AccountModalsProvider>
    </BookingProvider>
  );
}
