'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { LogoIcon } from '@/components/ui/logo-icon';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const SECTIONS = [
  { id: 'top', label: 'Inicio' },
  { id: 'about', label: 'Filosofía' },
  { id: 'services', label: 'Tratamientos' },
  { id: 'how', label: 'Experiencia' },
  { id: 'looks', label: 'Galería' },
  { id: 'team', label: 'Especialistas' },
  { id: 'reviews', label: 'Reseñas' },
  { id: 'faq', label: 'Preguntas' },
  { id: 'visit', label: 'Ubicación' },
];

export function HomeEffects() {
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const header = document.querySelector('.home-header');

    const onScroll = () => {
      if (header) {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      }

      let current = 'top';
      const line = window.innerHeight * 0.32;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) {
          current = section.id;
        }
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SECTIONS[SECTIONS.length - 1]?.id ?? current;
      }

      const navLinks = document.querySelectorAll('.home-nav a');
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === `#${current}`);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const hash = target.getAttribute('href') ?? '';
      const id = hash.slice(1);
      if (!id) return;
      const el = id === 'top' ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onAnchorClick);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>('.home-reveal'));

    let io: IntersectionObserver | null = null;
    if (reduce) {
      items.forEach((el) => el.classList.add('is-in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
      );
      items.forEach((el) => io?.observe(el));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onAnchorClick);
      if (io) io.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {loading && (
        <div className="home-page-loader">
          <span className="home-loader-glow" aria-hidden="true" />
          <div className="home-loader-content">
            <div className="home-loader-badge">
              <span className="home-loader-ring home-loader-ring--outer" />
              <span className="home-loader-ring home-loader-ring--inner" />
              <span className="home-loader-mark" style={{ display: 'grid', placeItems: 'center' }}>
                <LogoIcon />
              </span>
            </div>
            <span className="home-loader-text">Lumière Skin &amp; Spa</span>
            <span className="home-loader-sub">Dermoestética Facial · Bienestar · Luminosidad</span>
            <span className="home-loader-bar" aria-hidden="true">
              <i />
            </span>
          </div>
        </div>
      )}
    </>
  );
}
