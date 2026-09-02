-- ========================================================
-- SCHEMA SQL PARA LUMIÈRE SKIN & SPA (SUPABASE / POSTGRESQL)
-- ========================================================

-- 1. Tabla de Servicios / Tratamientos Faciales
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('limpieza', 'antiedad', 'hidratacion', 'acne', 'paquetes')),
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_mxn NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  popular BOOLEAN DEFAULT false,
  benefits JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Citas y Reservas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price_mxn NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  specialist_id TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_notes TEXT,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source TEXT DEFAULT 'web'
);

-- 3. Habilitar Seguridad a Nivel de Filas (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para la web
CREATE POLICY "Servicios visibles para todos" ON services FOR SELECT USING (active = true);
CREATE POLICY "Permitir crear citas desde la web" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura de citas para panel" ON appointments FOR SELECT USING (true);
CREATE POLICY "Actualizacion de citas para panel" ON appointments FOR UPDATE USING (true);
