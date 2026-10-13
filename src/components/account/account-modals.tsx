'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal } from '@/components/ui/modal';
import { ProfileEditor } from './profile-editor';
import { BookingsPanel } from './bookings-panel';
import { SettingsPanel } from './settings-panel';
import type { Profile } from '@/lib/supabase/auth';
import type { UserMetadata } from '@/lib/avatar';

export type AccountModal = 'profile' | 'bookings' | 'settings';

type Ctx = { openModal: (which: AccountModal) => void };
const AccountModalsContext = createContext<Ctx>({ openModal: () => {} });
export const useAccountModals = () => useContext(AccountModalsContext);

export function AccountModalsProvider({
  profile,
  userMetadata,
  hasPassword,
  children,
}: {
  profile: Profile | null;
  userMetadata: UserMetadata | null | undefined;
  hasPassword: boolean;
  children: ReactNode;
}) {
  const [active, setActive] = useState<AccountModal | null>(null);
  const close = () => setActive(null);
  const seed = profile?.email ?? profile?.fullName ?? 'guest';

  return (
    <AccountModalsContext.Provider value={{ openModal: setActive }}>
      {children}
      {profile && (
        <>
          <Modal open={active === 'profile'} onClose={close} title="Editar mi perfil">
            <ProfileEditor
              seed={seed}
              initialName={profile.fullName ?? ''}
              initialPhone={profile.phone ?? ''}
              userMetadata={userMetadata}
              email={profile.email}
              onClose={close}
            />
          </Modal>

          <Modal open={active === 'bookings'} onClose={close} title="Mis citas" wide>
            <BookingsPanel active={active === 'bookings'} />
          </Modal>

          <Modal open={active === 'settings'} onClose={close} title="Ajustes de cuenta">
            <SettingsPanel email={profile.email} hasPassword={hasPassword} />
          </Modal>
        </>
      )}
    </AccountModalsContext.Provider>
  );
}
