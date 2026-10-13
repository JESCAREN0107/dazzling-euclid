-- ============================================================================
-- LUMIÈRE SKIN & SPA — CORRECCIONES DE SEGURIDAD E INTEGRIDAD (auditoría)
-- Ejecutar DESPUÉS de 0001_schema.sql. Es idempotente: puede re-ejecutarse.
-- ============================================================================

-- ── 1. Las citas solo se crean desde el servidor ────────────────────────────
-- Antes, cualquiera con la clave anon (pública) podía insertar citas directo
-- por la API REST, saltándose horario, bloqueos y duración. Ahora la server
-- action `createBooking` valida todo e inserta con service_role.
drop policy if exists "public create booking" on public.bookings;

-- ── 2. Reseñas ligadas al usuario que las escribió ──────────────────────────
alter table public.stylist_reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists stylist_reviews_user_idx on public.stylist_reviews (user_id);

-- ── 3. anonymize_user_bookings: cerrar el hueco con auth.uid() NULL ─────────
-- Con un visitante anónimo `auth.uid() <> target` evaluaba NULL y el IF no
-- lanzaba la excepción, permitiendo anonimizar las citas de cualquier usuario.
create or replace function public.anonymize_user_bookings(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and auth.uid() is distinct from target
     and public.current_role() <> 'admin' then
    raise exception 'No autorizado';
  end if;

  update public.bookings
     set user_id        = null,
         customer_name  = 'Cliente eliminado',
         customer_phone = '0000000000',
         customer_email = null,
         notes          = ''
   where user_id = target;
end;
$$;

revoke execute on function public.anonymize_user_bookings(uuid) from public, anon;
grant execute on function public.anonymize_user_bookings(uuid) to authenticated, service_role;

-- ── 4. Especialistas: bloquear / desbloquear sus propios horarios ───────────
drop policy if exists "staff read own blocked_slots" on public.blocked_slots;
drop policy if exists "staff insert own blocked_slots" on public.blocked_slots;
drop policy if exists "staff delete own blocked_slots" on public.blocked_slots;

create policy "staff insert own blocked_slots" on public.blocked_slots
  for insert to authenticated
  with check (
    public.current_role() = 'staff'
    and stylist_id is not null
    and stylist_id = public.current_stylist_id()
  );

create policy "staff delete own blocked_slots" on public.blocked_slots
  for delete to authenticated
  using (
    public.current_role() = 'staff'
    and stylist_id is not null
    and stylist_id = public.current_stylist_id()
  );

-- ── 5. Especialistas no pueden alterar calificación ni orden de su tarjeta ──
create or replace function public.protect_stylist_card()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() = 'staff' then
    if new.rating       is distinct from old.rating
       or new.rating_count is distinct from old.rating_count
       or new.sort_order   is distinct from old.sort_order
       or new.slug         is distinct from old.slug then
      raise exception 'Solo un administrador puede modificar calificación, orden o slug';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists stylists_protect_card on public.stylists;
create trigger stylists_protect_card
  before update on public.stylists
  for each row execute function public.protect_stylist_card();

-- ── 6. Buckets de Storage usados por la app (lectura pública) ───────────────
-- Las subidas se hacen desde el servidor con service_role.
insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;
