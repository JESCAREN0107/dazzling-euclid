'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { signOut } from '@/app/admin/actions';
import { avatarSrc, type UserMetadata } from '@/lib/avatar';
import { ProfileModal } from '@/components/site/profile-modal';
import { LogoIcon } from '@/components/ui/logo-icon';
import type { Profile } from '@/lib/supabase/auth';

const NAV = [
  { href: '/admin', label: 'Resumen', exact: true },
  { href: '/admin/schedule', label: 'Agenda' },
  { href: '/admin/services', label: 'Tratamientos' },
  { href: '/admin/stylists', label: 'Especialistas' },
  { href: '/admin/gallery', label: 'Galería' },
  { href: '/admin/reviews', label: 'Reseñas' },
  { href: '/admin/content', label: 'Contenido y Horarios' },
  { href: '/admin/people', label: 'Equipo y Roles' },
];

export function AdminShell({
  profile,
  userMetadata,
  children,
}: {
  profile: Profile;
  userMetadata?: UserMetadata | null;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '/admin';
  const [profileOpen, setProfileOpen] = useState(false);

  const seed = profile.email ?? profile.fullName ?? 'admin';
  const src = avatarSrc(userMetadata, seed);

  return (
    <div className="admin shell--admin">
      <aside className="aside">
        <div className="aside__top">
          <Link href="/" className="nav__logo">
            <span className="nav__mark">
              <LogoIcon />
            </span>
            <span className="nav__brand">
              <b>Lumière</b>
              <small>Panel Administrador</small>
            </span>
          </Link>
        </div>

        <nav className="aside__nav" aria-label="Administración">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`aside__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="aside__foot">
          <button
            type="button"
            className="aside__user"
            onClick={() => setProfileOpen(true)}
            title="Editar perfil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aside__avatar" />
            <span className="aside__who">
              <span className="aside__name">
                {profile.fullName ?? profile.email ?? 'Administrador'}
              </span>
              <span className="aside__role">
                {profile.role === 'admin' ? 'Administrador' : 'Empleado'} · editar
              </span>
            </span>
          </button>
          <div className="aside__actions">
            <ThemeToggle />
            <form action={signOut} className="aside__signout">
              <button className="btn btn--ghost" type="submit">
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="amain">{children}</main>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        seed={seed}
        initialName={profile.fullName ?? ''}
        initialPhone={profile.phone ?? ''}
        userMetadata={userMetadata}
        email={profile.email}
      />
    </div>
  );
}
