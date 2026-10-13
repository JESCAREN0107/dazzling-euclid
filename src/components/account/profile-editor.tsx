'use client';
import { useRef, useState, useTransition } from 'react';
import {
  uploadAvatar,
  removeAvatar,
  updateProfileDetails,
  updateAvatarChoice,
} from '@/app/account/avatar-actions';
import { getAvatarInfo, dicebearUrl, type UserMetadata } from '@/lib/avatar';

export function ProfileEditor({
  seed,
  initialName,
  initialPhone,
  userMetadata,
  email,
  onClose,
}: {
  seed: string;
  initialName: string;
  initialPhone: string;
  userMetadata: UserMetadata | null | undefined;
  email: string | null;
  onClose?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const info = getAvatarInfo(userMetadata, seed);
  const [activeChoice, setActiveChoice] = useState<'custom' | 'dicebear' | 'email'>(info.choice);

  const [prevInitialName, setPrevInitialName] = useState<string>(initialName);
  const [prevInitialPhone, setPrevInitialPhone] = useState<string>(initialPhone);
  const [prevUserMetadata, setPrevUserMetadata] = useState<UserMetadata | null | undefined>(
    userMetadata,
  );

  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setName(initialName);
  }

  if (initialPhone !== prevInitialPhone) {
    setPrevInitialPhone(initialPhone);
    setPhone(initialPhone);
  }

  if (userMetadata !== prevUserMetadata) {
    setPrevUserMetadata(userMetadata);
    setActiveChoice(info.choice);
  }

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    setOk(false);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadAvatar(fd);
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice('custom');
        setOk(true);
      }
    });
  }

  function clearPhoto() {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await removeAvatar();
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice('dicebear');
        setOk(true);
      }
    });
  }

  function selectChoice(choice: 'custom' | 'dicebear' | 'email') {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await updateAvatarChoice(choice);
      if ('error' in res) setError(res.error);
      else {
        setActiveChoice(choice);
        setOk(true);
      }
    });
  }

  function saveDetails() {
    setError(null);
    setOk(false);
    start(async () => {
      const res = await updateProfileDetails(name, phone);
      if ('error' in res) setError(res.error);
      else setOk(true);
    });
  }

  let shown = dicebearUrl(seed);
  if (activeChoice === 'custom' && info.customAvatar) {
    shown = info.customAvatar;
  } else if (activeChoice === 'email' && info.emailAvatar) {
    shown = info.emailAvatar;
  }

  return (
    <>
      <div className="pm__avatar-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown} alt="Tu avatar" className="pm__avatar" />
        <div className="pm__avatar-actions">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            {pending ? 'Subiendo…' : 'Subir foto'}
          </button>

          {info.emailAvatar && activeChoice !== 'email' && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pending}
              onClick={() => selectChoice('email')}
            >
              Usar foto de Google
            </button>
          )}

          {activeChoice !== 'dicebear' && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pending}
              onClick={() => selectChoice('dicebear')}
            >
              Usar avatar ilustrado
            </button>
          )}

          {info.customAvatar && (
            <button
              type="button"
              className="btn btn--ghost-light"
              disabled={pending}
              onClick={clearPhoto}
              style={{
                color: 'var(--error)',
                borderColor: 'color-mix(in srgb, var(--error) 40%, var(--line))',
              }}
            >
              Eliminar foto
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          <p className="pm__hint">JPG, PNG, WEBP o GIF · máx. 5 MB.</p>
        </div>
      </div>

      <label className="pm__field">
        <span>Nombre completo</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre completo"
        />
      </label>
      <label className="pm__field">
        <span>Teléfono / WhatsApp (10 dígitos)</span>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="899 123 4567"
        />
      </label>
      <label className="pm__field">
        <span>Correo electrónico</span>
        <input value={email ?? ''} disabled />
      </label>

      {error && <p className="astatus astatus--err">{error}</p>}
      {ok && !error && <p className="astatus astatus--ok">Guardado.</p>}

      <div className="pm__foot">
        <button type="button" className="btn btn--primary" disabled={pending} onClick={saveDetails}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {onClose && (
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Listo
          </button>
        )}
      </div>
    </>
  );
}
