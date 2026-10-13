'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { SubmitButton, FormStatus, DeleteForm } from '@/components/admin/form-kit';
import { CardImg } from '@/components/admin/media-card';
import { setRole, adminDeleteUser } from './actions';
import { assignableRoles, canSetRole } from '@/lib/auth/role-rules';
import { dicebearUrl } from '@/lib/avatar';
import type { Role } from '@/lib/auth/roles';

export interface Person {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  stylist_id: string | null;
  avatar_src?: string;
}
export interface Stylist {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<string, string> = {
  user: 'Cliente (user)',
  staff: 'Empleado (staff)',
  admin: 'Administrador (admin)',
};

function RoleForm({
  p,
  stylists,
  actorRole,
}: {
  p: Person;
  stylists: Stylist[];
  actorRole: Role;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => setRole(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="person__edit">
      <input type="hidden" name="id" value={p.id} />
      <select name="role" defaultValue={p.role} aria-label="Rol">
        {assignableRoles(actorRole).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r] ?? r}
          </option>
        ))}
      </select>
      <select
        name="stylist_id"
        defaultValue={p.stylist_id ?? ''}
        aria-label="Especialista vinculada"
      >
        <option value="">— sin especialista —</option>
        {stylists.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <SubmitButton pending={pending} />
      <FormStatus state={state} />
    </form>
  );
}

export function PeopleList({
  people,
  stylists,
  actorRole,
}: {
  people: Person[];
  stylists: Stylist[];
  actorRole: Role;
}) {
  const chips: FilterChip<Person>[] = [
    { id: 'all', label: 'Todos', match: () => true },
    { id: 'admin', label: 'Administradores', match: (p) => p.role === 'admin' },
    { id: 'staff', label: 'Empleados', match: (p) => p.role === 'staff' },
    { id: 'user', label: 'Clientes', match: (p) => p.role === 'user' },
  ];
  return (
    <ListToolbar
      items={people}
      placeholder="Buscar por nombre o correo…"
      searchText={(p) => `${p.full_name ?? ''} ${p.email ?? ''}`}
      chips={chips}
      emptyLabel="Ningún usuario coincide con tus filtros."
      render={(rows) => (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
          {rows.map((p) => {
            const fallback = dicebearUrl(p.email ?? p.full_name);
            const canTouch = canSetRole(actorRole, p.role as Role, p.role as Role);
            return (
              <li key={p.id} className="person">
                <div className="person__id">
                  <span className="avatar" style={{ width: 38, height: 38 }}>
                    <CardImg src={p.avatar_src ?? fallback} fallbackSrc={fallback} alt="" />
                  </span>
                  <div>
                    <b style={{ fontSize: 14 }}>{p.full_name ?? '—'}</b>
                    <div className="step__hint" style={{ margin: 0 }}>
                      {p.email}
                    </div>
                  </div>
                </div>
                {canTouch ? (
                  <RoleForm p={p} stylists={stylists} actorRole={actorRole} />
                ) : (
                  <span className="role-badge">{ROLE_LABELS[p.role] ?? p.role}</span>
                )}
                {canTouch && actorRole === 'admin' && (
                  <div className="person__del">
                    <DeleteForm
                      action={adminDeleteUser}
                      id={p.id}
                      confirm={`¿Eliminar a ${p.full_name ?? p.email ?? 'este usuario'} y anonimizar sus citas? Esta acción no se puede deshacer.`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    />
  );
}
