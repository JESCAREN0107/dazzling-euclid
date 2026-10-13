'use client';
import { useActionState } from 'react';
import { inviteStaff } from './actions';

export function InviteStaffForm() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => inviteStaff(fd),
    undefined as undefined | { ok: true; note?: string } | { error: string },
  );
  return (
    <form action={action} className="invite-staff">
      <input
        type="email"
        name="email"
        placeholder="especialista@lumierespa.mx"
        required
        aria-label="Correo electrónico para invitar como personal"
      />
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Invitar como empleado'}
      </button>
      {state && 'error' in state && <p className="astatus astatus--err">{state.error}</p>}
      {state && 'ok' in state && <p className="astatus astatus--ok">{state.note ?? 'Listo.'}</p>}
    </form>
  );
}
