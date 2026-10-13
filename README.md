# Lumière Skin & Spa — Sitio Promocional y Sistema de Citas

Aplicación web completa de promoción y reservación de citas en línea para **Lumière Skin & Spa**, construida con **Next.js 15 (App Router, TypeScript)** y **Supabase (PostgreSQL, Auth, RLS, Storage)**, lista para desplegarse en **Vercel**.

---

## Características Principales

### 1. Página Pública Promocional (`/`)
- **Catálogo de tratamientos (`services`)**: organizados por categorías (*Faciales*, *Masajes*, *Corporales*, *Rituales Spa*, *Bienestar*), con descripción, beneficios clave, duración en minutos y precios en **Pesos Mexicanos (`MXN`)**.
- **Equipo de especialistas (`stylists`)**: tarjetas con fotografía o monograma, cargo, biografía, especialidades, calificación verificada y botón de reserva directa.
- **Galería visual (`gallery`)**: fotografías de cabinas, tratamientos e instalaciones administrables desde el panel privado.
- **Ubicación, horarios y contacto (`business_hours` + `site_content`)**: indicador en vivo (*Abierto ahora* / *Cerrado*), tabla semanal en zona horaria **`America/Matamoros`**, mapa interactivo, teléfono, correo y botón flotante de WhatsApp.

### 2. Sistema de Citas en Línea con Protección contra Duplicados
- **Asistente interactivo de 5 pasos**:
  1. Selección de uno o varios tratamientos (suma automática de duración y precio en `MXN`).
  2. Elección de especialista específica o *"Cualquier especialista disponible"*.
  3. Selección de fecha (próximos 30 días en horario `America/Matamoros`).
  4. Selección de horario disponible calculado en tiempo real cada 15 minutos, descontando citas confirmadas y bloqueos de horario.
  5. Datos de contacto del cliente, confirmación inmediata con folio único (`LUM-XXXXX`) y opción para enviar resumen por WhatsApp.
- **Triple protección contra citas duplicadas / traslapadas**:
  1. **Cálculo de intervalos (`src/lib/availability.ts`)**: filtra horarios ocupados por especialista y bloqueos generales o individuales.
  2. **Revalidación en servidor (`src/app/book/actions.ts`)**: antes de insertar, verifica nuevamente la disponibilidad en tiempo real y asigna automáticamente una especialista libre cuando se elige *"Cualquier especialista disponible"*.
  3. **Restricción a nivel de base de datos PostgreSQL (`supabase/migrations/0001_schema.sql`)**: índice `EXCLUDE USING gist (stylist_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&) WHERE (status = 'confirmed')` que impide físicamente cualquier traslape concurrente (código SQL `23P01`).

### 3. Panel Privado con Roles de Administrador (`admin`) y Empleado (`staff`)
- **Consola de Administración (`/admin`)** — exclusiva para rol `admin`:
  - **Resumen (`/admin`)**: métricas del día y del mes en `MXN`, citas de hoy y próximas confirmadas.
  - **Agenda y Citas (`/admin/schedule`)**: búsqueda por folio/cliente/teléfono, filtros por especialista y estado (*Confirmada*, *Completada*, *No asistió*, *Cancelada*).
  - **Horarios Bloqueados (dentro de `/admin/schedule`)**: bloqueo de rangos de horas para una especialista específica.
  - **Tratamientos y Precios (`/admin/services`)**: alta, edición y baja de tratamientos, categoría, beneficios, duración en minutos, precio en `MXN`, imagen, visibilidad y estado reservable.
  - **Especialistas (`/admin/stylists`)**: administración de perfiles públicos, foto, color distintivo, especialidades y estado en turno.
  - **Usuarios y Roles (`/admin/people`)**: creación de cuentas de personal/administrador y asignación de roles (`user`, `staff`, `admin`) vinculados a su perfil de especialista.
  - **Galería (`/admin/gallery`)**: subida de imágenes a Supabase Storage (`media`) o por URL.
  - **Contenido y Horarios (`/admin/content`)**: edición en vivo de textos promocionales (portada, barra de anuncio, historia, cinta promocional, preguntas frecuentes, banner CTA, contacto y redes sociales) y horarios semanales de apertura.
  - **Reseñas (`/admin/reviews`)**: moderación de calificaciones verificadas de clientes.
- **Panel de Especialista / Empleado (`/staff`)** — para roles `staff` y `admin`:
  - **Mi día (`/staff`)**: agenda del día de la especialista vinculada, indicador de siguiente cita en cabina, marcado de citas (*Completar*, *No asistió*, *Cancelar*) y reprogramación con selector de horarios libres.
  - **Bloqueos y ficha pública (dentro de `/staff`)**: bloqueo de horarios propios y edición de especialidad y etiquetas.
  - **Mi cuenta (`/account/settings`)**: edición de foto, datos de contacto y contraseña.

---

## Estructura del Repositorio

```text
├── src/
│   ├── app/
│   │   ├── (site)/             # Página pública promocional (/), aviso de privacidad y términos
│   │   ├── account/            # Acciones de cuenta de cliente, avatar, reseñas y cancelación
│   │   ├── admin/              # Consola privada de administración (/admin/*)
│   │   ├── auth/               # Rutas de callback OAuth/PKCE y confirmación OTP de Supabase
│   │   ├── book/               # Server Actions de disponibilidad y creación segura de citas
│   │   ├── forgot-password/    # Recuperación de contraseña
│   │   ├── login/              # Inicio de sesión con redirección inteligente por rol
│   │   ├── reset-password/     # Restablecimiento de contraseña
│   │   ├── signup/             # Registro de clientes
│   │   ├── staff/              # Panel privado para empleados/especialistas (/staff/*)
│   │   ├── globals.css         # Sistema de diseño Lumière Botanical Luxury (claro y oscuro)
│   │   └── layout.tsx          # Layout raíz (es-MX, fuentes y metadatos SEO)
│   ├── components/             # Componentes de interfaz (booking, home, site, admin, staff, account, ui)
│   ├── lib/                    # Utilidades (availability, time America/Matamoros, format MXN, supabase, schemas)
│   └── middleware.ts           # Refresco de sesión Supabase SSR y protección de rutas
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql     # Esquema PostgreSQL completo, constraint anti-traslapes, RPC y políticas RLS
│   │   ├── 0002_security_fixes.sql # Endurecimiento RLS, reseñas por usuario y buckets de Storage
│   │   └── 0003_review_author_privacy.sql # Oculta el autor (user_id) de las reseñas en la API pública
│   └── seed.sql                # Catálogo inicial de tratamientos, especialistas, horarios y galería (sin citas falsas)
├── .env.example                # Plantilla documentada de variables de entorno
├── next.config.ts              # Configuración de Next.js 15
└── vercel.json                 # Configuración de despliegue en Vercel (región iad1)
```

---

## Variables de Entorno de Supabase

Copia `.env.example` a `.env.local` para desarrollo local, o configura las siguientes variables en **Vercel → Project Settings → Environment Variables**:

| Variable | Tipo | Obligatoria | Descripción |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (Navegador + Servidor) | Sí | URL de tu proyecto en Supabase (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (Navegador + Servidor) | Sí | Clave anónima/publicable (`anon` / `publishable`). Respeta las políticas RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Privada (Solo Servidor)** | **Sí** | Clave `service_role` de Supabase. **Nunca** uses el prefijo `NEXT_PUBLIC_`. Está protegida con `import 'server-only'` en `src/lib/supabase/admin.ts`. Sin ella no se pueden registrar citas (la tabla no admite inserciones públicas) y en producción la app lanza un error. También permite subir archivos y crear cuentas de personal desde `/admin/people`. |
| `NEXT_PUBLIC_SITE_URL` | Pública | Recomendada | URL canónica del sitio desplegado (ej. `https://tu-dominio.vercel.app`) para enlaces de correo de autenticación y SEO. |

---

## Configuración de Supabase Paso a Paso

1. **Crear proyecto en Supabase**:
   - Entra a [database.new](https://database.new) y crea un nuevo proyecto.
2. **Ejecutar el esquema SQL**:
   - Abre **SQL Editor** en el panel de Supabase.
   - Copia y ejecuta el contenido completo de [`supabase/migrations/0001_schema.sql`](./supabase/migrations/0001_schema.sql) y después, en orden, [`0002_security_fixes.sql`](./supabase/migrations/0002_security_fixes.sql) y [`0003_review_author_privacy.sql`](./supabase/migrations/0003_review_author_privacy.sql).
   - Si tu base de datos ya existía, ejecuta solo las migraciones que falten (son idempotentes).
3. **Cargar el catálogo inicial (opcional pero recomendado)**:
   - En el **SQL Editor**, ejecuta [`supabase/seed.sql`](./supabase/seed.sql) para poblar los tratamientos iniciales en `MXN`, especialistas, horarios de apertura y galería (no inserta ninguna cita ni cliente de prueba).
4. **Crear tu primer usuario Administrador**:
   - Regístrate desde `/signup` en la aplicación (o crea un usuario desde **Authentication → Users** en Supabase).
   - En el **SQL Editor** de Supabase, promueve tu correo a `admin`:
     ```sql
     update public.profiles
     set role = 'admin'
     where email = 'tu-correo@ejemplo.com';
     ```
   - Una vez que inicies sesión como `admin`, podrás gestionar servicios, precios, horarios, especialistas y crear cuentas de empleados (`staff`) directamente desde **`/admin/people`**.

---

## Desarrollo Local y Despliegue en Vercel

### Ejecutar en local
```bash
npm install
npm run dev
```
Abre `http://localhost:3000`.

### Verificar compilación de producción
```bash
npm run typecheck
npm run build
```

### Desplegar en Vercel
1. Sube este repositorio a GitHub, GitLab o Bitbucket.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio (Vercel detectará automáticamente **Next.js** y `vercel.json`).
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Haz clic en **Deploy**.
5. En tu panel de Supabase (**Authentication → URL Configuration**), configura:
   - **Site URL**: `https://tu-proyecto.vercel.app`
   - **Redirect URLs**: `https://tu-proyecto.vercel.app/auth/callback` y `https://tu-proyecto.vercel.app/auth/confirm`
