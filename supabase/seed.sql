-- ============================================================================
-- LUMIÈRE SKIN & SPA — CATÁLOGO INICIAL Y CONFIGURACIÓN BASE
-- Nota: Solo incluye servicios, especialistas, horarios y bloques editoriales.
-- NO incluye citas ni clientes de prueba.
-- ============================================================================

insert into public.services (slug, name, description, category, benefits, price_mxn, duration_min, icon, image_url, bookable, is_featured, sort_order) values
  (
    'hidrodermoabrasion-profunda',
    'Limpieza Facial Profunda con Hidrodermoabrasión',
    'Extracción ultrasónica suave, punta diamante, infusión de sueros antioxidantes y máscara hidroplástica calmante para renovar la textura de tu piel.',
    'limpieza',
    array['Poros visiblemente limpios', 'Luminosidad inmediata', 'Sin dolor ni irritación'],
    850,
    60,
    'sparkles',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
    true,
    true,
    1
  ),
  (
    'glow-hidrafacial-3-en-1',
    'Glow HidraFacial 3 en 1',
    'Exfoliación enzimática, ácido hialurónico de bajo peso molecular y terapia LED regenerativa para devolver elasticidad y jugosidad al rostro.',
    'hidratacion',
    array['Hidratación multicapa', 'Efecto piel de porcelana', 'Ideal antes de eventos'],
    1100,
    50,
    'droplet',
    'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=900&q=85',
    true,
    false,
    2
  ),
  (
    'dermaplaning-oro-24k',
    'Dermaplaning Facial + Mascarilla de Oro 24K',
    'Remoción delicada de células muertas y vello facial fino combinada con velo de colágeno y oro 24K para una piel ultra suave y uniforme.',
    'antiedad',
    array['Textura de seda al instante', 'Mejor absorción de activos', 'Nutrición intensiva'],
    1350,
    75,
    'sun',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85',
    true,
    false,
    3
  ),
  (
    'tratamiento-purificante-anti-acne',
    'Tratamiento Purificante Anti-Acné & Control Sebo',
    'Protocolo clínico con ácido salicílico, alta frecuencia bactericida y mascarilla de arcilla verde botánica para equilibrar pieles mixtas o grasas.',
    'acne',
    array['Desinflamación rápida', 'Control de brillo facial', 'Prevención de brotes'],
    950,
    70,
    'shield',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    true,
    false,
    4
  ),
  (
    'lifting-radiofrecuencia-tripolar',
    'Lifting Facial Tensor con Radiofrecuencia Tripolar',
    'Estimulación térmica de colágeno y elastina mediante ondas tripolares, acompañada de drenaje linfático facial y suero reafirmante de péptidos.',
    'antiedad',
    array['Efecto tensor sin agujas', 'Redefinición del óvalo facial', 'Atenúa líneas de expresión'],
    1450,
    60,
    'flame',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
    true,
    false,
    5
  ),
  (
    'ritual-reina-lumiere',
    'Ritual Completo Reina Lumière (Facial + Espalda + Masaje)',
    'Nuestra experiencia insignia: Hidrodermoabrasión facial completa, limpieza de espalda con vapor de ozono y masaje relajante de cuello, hombros y cráneo.',
    'paquetes',
    array['Renovación total en una sesión', 'Alivio de tensión muscular', 'Aromaterapia botánica'],
    2200,
    110,
    'crown',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85',
    true,
    false,
    6
  )
on conflict (slug) do update set
  name         = excluded.name,
  description  = excluded.description,
  category     = excluded.category,
  benefits     = excluded.benefits,
  price_mxn    = excluded.price_mxn,
  duration_min = excluded.duration_min,
  icon         = excluded.icon,
  image_url    = excluded.image_url,
  bookable     = excluded.bookable,
  is_featured  = excluded.is_featured,
  sort_order   = excluded.sort_order;

insert into public.stylists (slug, name, role, tags, avatar_url, sort_order) values
  (
    'sofia-navarro',
    'Dra. Sofía Navarro',
    'Cosmiatra & Especialista en Dermoestética Facial',
    array['Hidrodermoabrasión', 'Peelings Clínicos', 'Lifting con Radiofrecuencia'],
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    1
  ),
  (
    'valeria-morales',
    'Lic. Valeria Morales',
    'Terapeuta Facial & Cosmetóloga Clínica',
    array['Dermaplaning', 'Control Anti-Acné', 'Masaje Facial Kobido'],
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    2
  )
on conflict (slug) do update set
  name       = excluded.name,
  role       = excluded.role,
  tags       = excluded.tags,
  avatar_url = excluded.avatar_url,
  sort_order = excluded.sort_order;

-- Horarios en America/Matamoros:
-- Lunes (1) cerrado; Martes a Sábado (2..6) 09:00 a 19:00 (540..1140); Domingo (0) 10:00 a 15:00 (600..900)
insert into public.business_hours (day_of_week, open_minute, close_minute, is_closed) values
  (0, 600, 900,  false),
  (1, 540, 1140, true),
  (2, 540, 1140, false),
  (3, 540, 1140, false),
  (4, 540, 1140, false),
  (5, 540, 1140, false),
  (6, 540, 1140, false)
on conflict (day_of_week) do update set
  open_minute  = excluded.open_minute,
  close_minute = excluded.close_minute,
  is_closed    = excluded.is_closed;

insert into public.gallery (title, tag, category, image_url, sort_order) values
  ('Hidrodermoabrasión Clínica', 'Poros Limpios · Glow', 'Limpieza Facial', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85', 1),
  ('Cabina Sensorial Lumière',   'Aromaterapia · Calma', 'Instalaciones',   'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85', 2),
  ('Velo de Colágeno & Oro 24K', 'Nutrición · Antiedad', 'Rejuvenecimiento','https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85', 3),
  ('Terapia Facial Hidratante',  'Ácido Hialurónico',    'Hidratación',     'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=900&q=85', 4),
  ('Masaje Relajante Craneofacial','Bienestar Integral', 'Rituales Spa',    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85', 5),
  ('Protocolo Dermoestético',    'Diagnóstico Clínico',  'Tecnología',      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85', 6);
