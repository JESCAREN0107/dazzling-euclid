'use client';
import { Modal } from '@/components/ui/modal';
import { ProfileEditor } from '@/components/account/profile-editor';
import type { UserMetadata } from '@/lib/avatar';

export function ProfileModal({
  open,
  onClose,
  seed,
  initialName,
  initialPhone,
  userMetadata,
  email,
}: {
  open: boolean;
  onClose: () => void;
  seed: string;
  initialName: string;
  initialPhone: string;
  userMetadata: UserMetadata | null | undefined;
  email: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Editar mi perfil">
      <ProfileEditor
        seed={seed}
        initialName={initialName}
        initialPhone={initialPhone}
        userMetadata={userMetadata}
        email={email}
        onClose={onClose}
      />
    </Modal>
  );
}
