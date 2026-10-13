'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';

type Item = { href: string; label: string; icon: IconName };

const SECTIONS: { heading: string; items: Item[] }[] = [
  {
    heading: 'Operaciones',
    items: [
      { href: '/admin', label: 'Resumen', icon: 'sparkle' },
      { href: '/admin/schedule', label: 'Agenda y Citas', icon: 'calendar' },
      { href: '/admin/blocked-slots', label: 'Horarios Bloqueados', icon: 'clock' },
    ],
  },
  {
    heading: 'Catálogo y Equipo',
    items: [
      { href: '/admin/services', label: 'Tratamientos', icon: 'scissors' },
      { href: '/admin/stylists', label: 'Especialistas', icon: 'user' },
      { href: '/admin/people', label: 'Usuarios y Roles', icon: 'shield' },
      { href: '/admin/reviews', label: 'Reseñas', icon: 'star' },
    ],
  },
  {
    heading: 'Sitio Promocional',
    items: [
      { href: '/admin/gallery', label: 'Galería', icon: 'sparkle' },
      { href: '/admin/content', label: 'Contenido y Horarios', icon: 'settings' },
    ],
  },
  {
    heading: 'Cuenta',
    items: [
      { href: '/admin/account', label: 'Mi Perfil', icon: 'user' },
    ],
  },
];

export function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="anav">
      {SECTIONS.map((sec) => (
        <div key={sec.heading} className="anav-group">
          <div className="anav-heading">{sec.heading}</div>
          {sec.items.map((n) => {
            const active =
              n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`anav-link ${active ? 'active' : ''}`}
              >
                <Icon name={n.icon} size={16} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
