-- ============================================================================
-- LUMIÈRE SKIN & SPA — ESQUEMA PRINCIPAL DE SUPABASE (PostgreSQL + RLS)
-- Zona Horaria: America/Matamoros | Moneda: MXN | Idioma: Español (es-MX)
-- ============================================================================

create extension if not exists "btree_gist";

-- ── 1. Tratamientos / Servicios ─────────────────────────────────────────────
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  category     text not null check (category in ('limpieza', 'hidratacion', 'antiedad', 'acne', 'paquetes')),
  benefits     text[] not null default '{}',
  price_mxn    integer not null check (price_mxn >= 0),
  duration_min integer not null check (duration_min > 0),
  icon         text not null default 'sparkles',
  image_url    text,
  bookable     boolean not null default true,
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── 2. Especialistas / Personal ─────────────────────────────────────────────
create table if not exists public.stylists (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  role         text not null default '',
  tags         text[] not null default '{}',
  avatar_url   text,
  rating       numeric(3,2) default null check (rating is null or (rating >= 0 and rating <= 5)),
  rating_count integer not null default 0 check (rating_count >= 0),
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── 3. Horarios de Apertura (0 = Domingo … 6 = Sábado) ──────────────────────
create table if not exists public.business_hours (
  day_of_week  smallint primary key check (day_of_week between 0 and 6),
  open_minute  smallint not null check (open_minute between 0 and 1440),
  close_minute smallint not null check (close_minute between 0 and 1440),
  is_closed    boolean not null default false
);

-- ── 4. Bloqueos de Horario (stylist_id NULL = todo el spa) ──────────────────
create table if not exists public.blocked_slots (
  id          uuid primary key default gen_random_uuid(),
  stylist_id  uuid references public.stylists(id) on delete cascade,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  reason      text not null default '',
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ── 5. Citas / Reservaciones (con protección contra citas duplicadas) ───────
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  reference      text unique not null,
  service_id     uuid not null references public.services(id) on delete restrict,
  service_ids    uuid[],
  stylist_id     uuid references public.stylists(id) on delete set null,
  user_id        uuid references auth.users(id) on delete set null,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  customer_name  text not null,
  customer_phone text not null,
  customer_email text,
  notes          text not null default '',
  status         text not null default 'confirmed'
                   check (status in ('confirmed', 'completed', 'no_show', 'cancelled')),
  created_at     timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Impide a nivel de motor PostgreSQL dos citas confirmadas que se traslapen
  -- para la misma especialista en el mismo rango de tiempo.
  constraint bookings_no_overlap exclude using gist (
    stylist_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed' and stylist_id is not null)
);

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
create index if not exists bookings_stylist_idx   on public.bookings (stylist_id, starts_at);
create index if not exists bookings_user_idx      on public.bookings (user_id, starts_at desc);

-- ── 6. Galería Promocional y Resultados ─────────────────────────────────────
create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  tag        text not null default '',
  category   text not null default '',
  image_url  text not null default '',
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── 7. Contenido Promocional Editable (CMS en JSONB) ────────────────────────
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── 8. Perfiles de Usuario y Roles (user | staff | admin) ───────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'staff', 'admin')),
  stylist_id  uuid references public.stylists(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── 9. Reseñas de Especialistas ─────────────────────────────────────────────
create table if not exists public.stylist_reviews (
  id            uuid primary key default gen_random_uuid(),
  stylist_id    uuid not null references public.stylists(id) on delete cascade,
  booking_id    uuid references public.bookings(id) on delete set null,
  customer_name text not null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text not null default '',
  likes_count   integer not null default 0 check (likes_count >= 0),
  reports_count integer not null default 0 check (reports_count >= 0),
  created_at    timestamptz not null default now()
);

create unique index if not exists stylist_reviews_booking_id_unique
  on public.stylist_reviews (booking_id)
  where booking_id is not null;

-- ── Funciones Auxiliares y Seguridad (Security Definer) ─────────────────────

-- Devuelve intervalos ocupados sin exponer datos personales de los clientes
create or replace function public.busy_slots(range_from timestamptz, range_to timestamptz)
returns table (stylist_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select b.stylist_id, b.starts_at, b.ends_at
  from public.bookings b
  where b.status = 'confirmed'
    and b.ends_at   > range_from
    and b.starts_at < range_to;
$$;

grant execute on function public.busy_slots(timestamptz, timestamptz) to anon, authenticated;

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

create or replace function public.current_stylist_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select stylist_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_role()       to anon, authenticated;
grant execute on function public.current_stylist_id() to anon, authenticated;

-- Creación automática de perfil al registrarse un usuario en Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    'user'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protección contra escalación de privilegios en perfiles
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.current_role();
begin
  if (new.role is distinct from old.role or new.stylist_id is distinct from old.stylist_id) then
    if actor <> 'admin' then
      raise exception 'Solo un administrador puede modificar roles o asignaciones de especialista';
    end if;
  end if;
  if new.email is distinct from old.email and auth.uid() is not null then
    raise exception 'El correo electrónico se sincroniza desde la cuenta de autenticación';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- Anonimización de citas al eliminar cuenta de cliente
create or replace function public.anonymize_user_bookings(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and auth.uid() <> target and public.current_role() <> 'admin' then
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

grant execute on function public.anonymize_user_bookings(uuid) to authenticated, service_role;

-- ── Políticas Row-Level Security (RLS) ──────────────────────────────────────
alter table public.services        enable row level security;
alter table public.stylists        enable row level security;
alter table public.business_hours  enable row level security;
alter table public.blocked_slots   enable row level security;
alter table public.bookings        enable row level security;
alter table public.gallery         enable row level security;
alter table public.site_content    enable row level security;
alter table public.profiles        enable row level security;
alter table public.stylist_reviews enable row level security;

-- Lectura pública de catálogo, personal activo, horarios, bloqueos, galería y contenido
create policy "public read services"       on public.services        for select using (is_active = true);
create policy "public read stylists"       on public.stylists        for select using (is_active = true);
create policy "public read hours"          on public.business_hours  for select using (true);
create policy "public read blocked_slots"  on public.blocked_slots   for select using (true);
create policy "public read gallery"        on public.gallery         for select using (is_active = true);
create policy "public read site_content"   on public.site_content    for select using (true);
create policy "public read reviews"        on public.stylist_reviews for select using (true);

-- Creación pública de citas (clientes invitados o autenticados)
create policy "public create booking" on public.bookings
  for insert to anon, authenticated
  with check (
    status = 'confirmed'
    and char_length(customer_name) between 2 and 120
    and char_length(customer_phone) between 7 and 30
    and (user_id is null or user_id = auth.uid())
  );

-- Lectura de citas propias para clientes autenticados
create policy "user read own bookings" on public.bookings
  for select to authenticated
  using (user_id = auth.uid());

-- Acceso de Empleado (staff): ver y actualizar sus citas asignadas y su perfil de especialista
create policy "staff read own bookings" on public.bookings
  for select to authenticated
  using (
    public.current_role() = 'staff'
    and stylist_id is not null
    and stylist_id = public.current_stylist_id()
  );

create policy "staff update own bookings" on public.bookings
  for update to authenticated
  using (
    public.current_role() = 'staff'
    and stylist_id is not null
    and stylist_id = public.current_stylist_id()
  )
  with check (
    public.current_role() = 'staff'
    and stylist_id is not null
    and stylist_id = public.current_stylist_id()
  );

create policy "staff read own stylist card" on public.stylists
  for select to authenticated
  using (
    public.current_role() = 'staff'
    and id = public.current_stylist_id()
  );

create policy "staff update own stylist card" on public.stylists
  for update to authenticated
  using (
    public.current_role() = 'staff'
    and id = public.current_stylist_id()
  )
  with check (
    public.current_role() = 'staff'
    and id = public.current_stylist_id()
  );

-- Acceso total para Administrador (admin)
create policy "admin all services"        on public.services        for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all stylists"        on public.stylists        for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all hours"           on public.business_hours  for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all blocked_slots"   on public.blocked_slots   for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all bookings"        on public.bookings        for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all gallery"         on public.gallery         for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all site_content"    on public.site_content    for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin all stylist_reviews" on public.stylist_reviews for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Perfiles de usuario
create policy "read own profile"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admin read profiles"   on public.profiles for select to authenticated using (public.current_role() = 'admin');
create policy "admin update profiles" on public.profiles for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin delete profiles" on public.profiles for delete to authenticated using (public.current_role() = 'admin');
