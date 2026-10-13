'use client';
import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/app/reset-password/actions';
import { deleteMyAccount } from '@/app/account/delete-actions';
import { checkPassword } from '@/lib/auth/password';
import { PasswordInput } from '@/components/auth/password-input';

export function SettingsPanel({
  email,
  hasPassword,
}: {
  email: string | null;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [pwState, pwAction, pwPending] = useActionState(updatePassword, undefined);
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [passwordExists, setPasswordExists] = useState(hasPassword);
  const [editingPw, setEditingPw] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [delError, setDelError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  const check = checkPassword(pw);
  const barColor =
    check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirmPw.length > 0 && pw === confirmPw;
  const justSaved = Boolean(pwState && 'ok' in pwState);

  if (justSaved && !passwordExists) setPasswordExists(true);
  const showPwForm = !justSaved && (!passwordExists || editingPw);

  function onDelete() {
    setDelError(null);
    startDelete(async () => {
      const res = await deleteMyAccount(typed);
      if ('error' in res) setDelError(res.error);
      else {
        router.push('/?deleted=1');
        router.refresh();
      }
    });
  }

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <section>
        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>
          {passwordExists ? 'Contraseña' : 'Establecer una contraseña'}
        </h3>

        {!showPwForm ? (
          <div>
            <p className="step__hint" style={{ margin: '0 0 12px' }}>
              {justSaved
                ? '✓ Contraseña actualizada.'
                : 'Tienes una contraseña configurada para iniciar sesión con tu correo.'}
            </p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setPw('');
                setConfirmPw('');
                setEditingPw(true);
              }}
            >
              Cambiar contraseña
            </button>
          </div>
        ) : (
          <>
            <p className="step__hint" style={{ margin: '0 0 14px' }}>
              {passwordExists
                ? `Elige una nueva contraseña${email ? ` para ${email}` : ''}.`
                : `Iniciaste sesión con Google. Crea una contraseña para también entrar con ${email ?? 'tu correo'}.`}
            </p>
            <form action={pwAction}>
              <div className="field">
                <label htmlFor="st-pw">Nueva contraseña</label>
                <PasswordInput
                  id="st-pw"
                  name="password"
                  required
                  value={pw}
                  onChange={setPw}
                  autoComplete="new-password"
                />
                <div className={`pwmeta${pw ? ' show' : ''}`}>
                  <div>
                    <div className="meter">
                      <i style={{ width: `${(check.score / 5) * 100}%`, background: barColor }} />
                    </div>
                    <ul className="reqs">
                      {check.results.map((r) => (
                        <li key={r.id} className={r.met ? 'met' : ''}>
                          <span className="dot">{r.met ? '✓' : ''}</span> {r.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="st-cf">Confirmar contraseña</label>
                <PasswordInput
                  id="st-cf"
                  name="confirm"
                  required
                  value={confirmPw}
                  onChange={setConfirmPw}
                  autoComplete="new-password"
                />
                {confirmPw.length > 0 && (
                  <p className={`match ${matches ? 'ok' : 'bad'}`}>
                    {matches ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              {pwState && 'error' in pwState && (
                <p style={{ color: 'var(--error)', margin: '0 0 10px', fontSize: 13 }}>
                  {pwState.error}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!check.passed || !matches || pwPending}
                >
                  {pwPending
                    ? 'Guardando…'
                    : passwordExists
                      ? 'Actualizar contraseña'
                      : 'Establecer contraseña'}
                </button>
                {passwordExists && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setEditingPw(false)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      <section style={{ paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--error)' }}>Eliminar cuenta</h3>
        <p className="step__hint" style={{ margin: '0 0 12px' }}>
          Elimina permanentemente tu inicio de sesión, perfil y avatar, y anonimiza tus citas
          pasadas. Esta acción no se puede deshacer.
        </p>

        {!confirmOpen ? (
          <button
            type="button"
            className="btn btn--ghost"
            style={{ color: 'var(--error)', borderColor: 'rgba(214,69,69,0.35)' }}
            onClick={() => setConfirmOpen(true)}
          >
            Eliminar mi cuenta…
          </button>
        ) : (
          <div
            className="card"
            style={{ borderColor: 'rgba(214,69,69,0.4)', background: 'rgba(214,69,69,0.06)' }}
          >
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="del-confirm">
                Escribe <b>DELETE</b> para confirmar
              </label>
              <input
                id="del-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>
            {delError && (
              <p style={{ color: 'var(--error)', margin: '0 0 10px', fontSize: 13 }} role="alert">
                {delError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn--primary"
                style={{ background: 'var(--error)', color: '#fff' }}
                disabled={typed.trim() !== 'DELETE' || deleting}
                onClick={onDelete}
              >
                {deleting ? 'Eliminando…' : 'Eliminar permanentemente'}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={deleting}
                onClick={() => {
                  setConfirmOpen(false);
                  setTyped('');
                  setDelError(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
