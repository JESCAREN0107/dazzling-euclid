'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ProfileModal } from '@/components/site/profile-modal';
import { signOut } from '@/app/admin/actions';
import { avatarSrc, type UserMetadata } from '@/lib/avatar';
import { LogoIcon } from '@/components/ui/logo-icon';
import type { Profile } from '@/lib/supabase/auth';

export function StaffHeader({
  profile,
  userMetadata,
  extra,
}: {
  profile: Profile;
  userMetadata?: UserMetadata | null;
  extra?: ReactNode;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const seed = profile.email ?? profile.fullName ?? 'staff';
  const src = avatarSrc(userMetadata, seed);

  return (
    <>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <Link href="/" className="nav__logo">
          <span className="nav__mark">
            <LogoIcon />
          </span>
          <span className="nav__brand">
            <b>Lumière</b>
            <small>Agenda de Especialista</small>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {extra}
          <ThemeToggle />
          <button
            type="button"
            className="nav-profile__btn"
            onClick={() => setProfileOpen(true)}
            aria-label="Editar perfil"
            title="Editar perfil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="nav-profile__avatar" />
          </button>
          <form action={signOut}>
            <button className="btn btn--ghost" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        seed={seed}
        initialName={profile.fullName ?? ''}
        initialPhone={profile.phone ?? ''}
        userMetadata={userMetadata}
        email={profile.email}
      />
    </>
  );
}
