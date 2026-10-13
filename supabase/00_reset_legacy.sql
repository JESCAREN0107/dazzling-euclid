-- ⚠️  DESTRUCTIVO: borra tablas y TODOS sus datos (incluye public.services).
-- Úsalo solo una vez para migrar desde la versión anterior; NUNCA en producción activa.
-- Elimina las tablas de la versión anterior (confirmado por el usuario: opción 2).
-- Ejecutar ANTES de 0001_schema.sql y seed.sql.
drop table if exists public.appointments cascade;
drop table if exists public.services cascade;
