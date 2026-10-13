-- ============================================================================
-- LUMIÈRE SKIN & SPA — PRIVACIDAD DEL AUTOR DE RESEÑAS
-- Ejecutar DESPUÉS de 0002_security_fixes.sql. Es idempotente.
-- ============================================================================

-- La lectura pública de reseñas no debe exponer el UUID de cuenta del autor.
-- Se otorga SELECT solo sobre las columnas públicas; user_id queda accesible
-- únicamente para service_role (server actions).
revoke select on public.stylist_reviews from anon, authenticated;
grant select (
  id, stylist_id, booking_id, customer_name, rating, comment,
  likes_count, reports_count, created_at
) on public.stylist_reviews to anon, authenticated;
