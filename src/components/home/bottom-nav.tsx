'use client';

import { useEffect, useRef, useState } from 'react';
import { useBooking } from '@/components/booking/booking-provider';
import { useAccountModals, type AccountModal } from '@/components/account/account-modals';
import { signOut } from '@/app/admin/actions';

const LEFT = [
  { id: 'top', label: 'Inicio', icon: 'home' },
  { id: 'services', label: 'Tratamientos', icon: 'sparkles' },
] as const;

const MORE_LINKS = [
  { id: 'about', label: 'Filosofía' },
  { id: 'how', label: 'Experiencia' },
  { id: 'looks', label: 'Galería' },
  { id: 'team', label: 'Especialistas' },
  { id: 'reviews', label: 'Reseñas' },
  { id: 'faq', label: 'Preguntas frecuentes' },
  { id: 'visit', label: 'Ubicación y horarios' },
];

const SPY_IDS = ['top', 'about', 'services', 'how', 'looks', 'team', 'reviews', 'faq', 'visit'];

function Icon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3l1.9 4.9L19 9.8l-4.9 1.9L12 16.6l-2.1-4.9L5 9.8l5.1-1.9L12 3z" />
          <path d="M5 19l1-2.5L8.5 15.5 6 14.5 5 12l-1 2.5-2.5 1 2.5 1L5 19z" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case 'more':
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomNav({
  signedIn,
  accountHref,
  accountLabel,
  avatarSrc,
}: {
  signedIn: boolean;
  accountHref: string | null;
  accountLabel: string;
  avatarSrc?: string | null;
}) {
  const { openBooking, enabled } = useBooking();
  const { openModal } = useAccountModals();
  const [active, setActive] = useState<string>('top');
  const [moreOpen, setMoreOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let current = 'top';
      const line = window.innerHeight * 0.4;
      for (const id of SPY_IDS) {
        const el = id === 'top' ? null : document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SPY_IDS[SPY_IDS.length - 1] ?? current;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!moreOpen && !acctOpen) return;
    const closeAll = () => {
      setMoreOpen(false);
      setAcctOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, acctOpen]);

  function pickAccount(modal: AccountModal) {
    setAcctOpen(false);
    openModal(modal);
  }

  const moreActive = MORE_LINKS.some((l) => l.id === active);

  return (
    <div className="home-dock" ref={moreRef}>
      <div className={`home-dock__sheet${moreOpen ? ' is-open' : ''}`} role="menu">
        {MORE_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            role="menuitem"
            className={`home-dock__sheet-item${active === l.id ? ' is-active' : ''}`}
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen(false);
            }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className={`home-dock__sheet${acctOpen ? ' is-open' : ''}`} role="menu">
        <button
          type="button"
          role="menuitem"
          className="home-dock__sheet-item"
          onClick={() => pickAccount('profile')}
        >
          Editar perfil
        </button>
        <button
          type="button"
          role="menuitem"
          className="home-dock__sheet-item"
          onClick={() => pickAccount('bookings')}
        >
          Mis citas
        </button>
        <button
          type="button"
          role="menuitem"
          className="home-dock__sheet-item"
          onClick={() => pickAccount('settings')}
        >
          Ajustes
        </button>
        <form action={signOut}>
          <button
            type="submit"
            role="menuitem"
            className="home-dock__sheet-item home-dock__sheet-item--danger"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <nav className="home-bottomnav" aria-label="Navegación rápida">
        {LEFT.map((tTab) => (
          <a
            key={tTab.id}
            href={`#${tTab.id}`}
            className={`home-bottomnav__tab${active === tTab.id ? ' is-active' : ''}`}
            aria-current={active === tTab.id ? 'page' : undefined}
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen(false);
            }}
          >
            <Icon name={tTab.icon} />
            <span>{tTab.label}</span>
          </a>
        ))}

        {enabled ? (
          <button
            type="button"
            className="home-bottomnav__center"
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen(false);
              openBooking();
            }}
            aria-label="Reservar una cita"
          >
            <Icon name="book" />
            <span>Reservar</span>
          </button>
        ) : (
          <a
            href="#top"
            className="home-bottomnav__center"
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen(false);
            }}
            aria-label="Inicio"
          >
            <Icon name="home" />
            <span>Inicio</span>
          </a>
        )}

        <button
          type="button"
          className={`home-bottomnav__tab${moreActive || moreOpen ? ' is-active' : ''}`}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          onClick={() => {
            setAcctOpen(false);
            setMoreOpen((v) => !v);
          }}
        >
          <Icon name="more" />
          <span>Más</span>
        </button>

        {accountHref ? (
          <a
            href={accountHref}
            className="home-bottomnav__tab"
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen(false);
            }}
          >
            {signedIn && avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="home-bottomnav__avatar" />
            ) : (
              <Icon name="user" />
            )}
            <span>{signedIn ? accountLabel : 'Entrar'}</span>
          </a>
        ) : (
          <button
            type="button"
            className={`home-bottomnav__tab${acctOpen ? ' is-active' : ''}`}
            aria-haspopup="menu"
            aria-expanded={acctOpen}
            onClick={() => {
              setMoreOpen(false);
              setAcctOpen((v) => !v);
            }}
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="home-bottomnav__avatar" />
            ) : (
              <Icon name="user" />
            )}
            <span>{accountLabel}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
