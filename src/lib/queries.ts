import { createClient } from '@/lib/supabase/server';
import type {
  BusinessHour,
  GalleryItem,
  Service,
  Stylist,
  StylistReview,
} from '@/lib/supabase/types';

// Catálogo oficial de respaldo de Lumière Skin & Spa para que la página pública
// siempre muestre los tratamientos, precios, especialistas y horarios reales del
// negocio incluso antes de ejecutar supabase/seed.sql.
// NUNCA incluye citas ni datos de clientes de prueba.
export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'lum-svc-1',
    slug: 'hidrodermoabrasion-profunda',
    name: 'Limpieza Facial Profunda con Hidrodermoabrasión',
    description:
      'Extracción ultrasónica suave, punta diamante, infusión de sueros antioxidantes y máscara hidroplástica calmante para renovar la textura de tu piel.',
    category: 'limpieza',
    benefits: ['Poros visiblemente limpios', 'Luminosidad inmediata', 'Sin dolor ni irritación'],
    price_mxn: 850,
    duration_min: 60,
    icon: 'sparkles',
    image_url:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'lum-svc-2',
    slug: 'glow-hidrafacial-3-en-1',
    name: 'Glow HidraFacial 3 en 1',
    description:
      'Exfoliación enzimática, ácido hialurónico de bajo peso molecular y terapia LED regenerativa para devolver elasticidad y jugosidad al rostro.',
    category: 'hidratacion',
    benefits: ['Hidratación multicapa', 'Efecto piel de porcelana', 'Ideal antes de eventos'],
    price_mxn: 1100,
    duration_min: 50,
    icon: 'droplet',
    image_url:
      'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: false,
    sort_order: 2,
  },
  {
    id: 'lum-svc-3',
    slug: 'dermaplaning-oro-24k',
    name: 'Dermaplaning Facial + Mascarilla de Oro 24K',
    description:
      'Remoción delicada de células muertas y vello facial fino combinada con velo de colágeno y oro 24K para una piel ultra suave y uniforme.',
    category: 'antiedad',
    benefits: ['Textura de seda al instante', 'Mejor absorción de activos', 'Nutrición intensiva'],
    price_mxn: 1350,
    duration_min: 75,
    icon: 'sun',
    image_url:
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: false,
    sort_order: 3,
  },
  {
    id: 'lum-svc-4',
    slug: 'tratamiento-purificante-anti-acne',
    name: 'Tratamiento Purificante Anti-Acné & Control Sebo',
    description:
      'Protocolo clínico con ácido salicílico, alta frecuencia bactericida y mascarilla de arcilla verde botánica para equilibrar pieles mixtas o grasas.',
    category: 'acne',
    benefits: ['Desinflamación rápida', 'Control de brillo facial', 'Prevención de brotes'],
    price_mxn: 950,
    duration_min: 70,
    icon: 'shield',
    image_url:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: false,
    sort_order: 4,
  },
  {
    id: 'lum-svc-5',
    slug: 'lifting-radiofrecuencia-tripolar',
    name: 'Lifting Facial Tensor con Radiofrecuencia Tripolar',
    description:
      'Estimulación térmica de colágeno y elastina mediante ondas tripolares, acompañada de drenaje linfático facial y suero reafirmante de péptidos.',
    category: 'antiedad',
    benefits: ['Efecto tensor sin agujas', 'Redefinición del óvalo facial', 'Atenúa líneas de expresión'],
    price_mxn: 1450,
    duration_min: 60,
    icon: 'flame',
    image_url:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: false,
    sort_order: 5,
  },
  {
    id: 'lum-svc-6',
    slug: 'ritual-reina-lumiere',
    name: 'Ritual Completo Reina Lumière (Facial + Espalda + Masaje)',
    description:
      'Nuestra experiencia insignia: Hidrodermoabrasión facial completa, limpieza de espalda con vapor de ozono y masaje relajante de cuello, hombros y cráneo.',
    category: 'paquetes',
    benefits: ['Renovación total en una sesión', 'Alivio de tensión muscular', 'Aromaterapia botánica'],
    price_mxn: 2200,
    duration_min: 110,
    icon: 'crown',
    image_url:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85',
    bookable: true,
    is_active: true,
    is_featured: false,
    sort_order: 6,
  },
];

export const DEFAULT_STYLISTS: Stylist[] = [
  {
    id: 'lum-sty-1',
    slug: 'sofia-navarro',
    name: 'Dra. Sofía Navarro',
    role: 'Cosmiatra & Especialista en Dermoestética Facial',
    tags: ['Hidrodermoabrasión', 'Peelings Clínicos', 'Lifting con Radiofrecuencia'],
    avatar_url:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    rating: null,
    rating_count: 0,
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'lum-sty-2',
    slug: 'valeria-morales',
    name: 'Lic. Valeria Morales',
    role: 'Terapeuta Facial & Cosmetóloga Clínica',
    tags: ['Dermaplaning', 'Control Anti-Acné', 'Masaje Facial Kobido'],
    avatar_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    rating: null,
    rating_count: 0,
    sort_order: 2,
    is_active: true,
  },
];

export const DEFAULT_HOURS: BusinessHour[] = [
  { day_of_week: 0, open_minute: 600, close_minute: 900, is_closed: false },
  { day_of_week: 1, open_minute: 540, close_minute: 1140, is_closed: true },
  { day_of_week: 2, open_minute: 540, close_minute: 1140, is_closed: false },
  { day_of_week: 3, open_minute: 540, close_minute: 1140, is_closed: false },
  { day_of_week: 4, open_minute: 540, close_minute: 1140, is_closed: false },
  { day_of_week: 5, open_minute: 540, close_minute: 1140, is_closed: false },
  { day_of_week: 6, open_minute: 540, close_minute: 1140, is_closed: false },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'lum-gal-1',
    title: 'Hidrodermoabrasión Clínica',
    tag: 'Poros Limpios · Glow',
    category: 'Limpieza Facial',
    image_url:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'lum-gal-2',
    title: 'Cabina Sensorial Lumière',
    tag: 'Aromaterapia · Calma',
    category: 'Instalaciones',
    image_url:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'lum-gal-3',
    title: 'Velo de Colágeno & Oro 24K',
    tag: 'Nutrición · Antiedad',
    category: 'Rejuvenecimiento',
    image_url:
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'lum-gal-4',
    title: 'Terapia Facial Hidratante',
    tag: 'Ácido Hialurónico',
    category: 'Hidratación',
    image_url:
      'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=900&q=85',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'lum-gal-5',
    title: 'Masaje Relajante Craneofacial',
    tag: 'Bienestar Integral',
    category: 'Rituales Spa',
    image_url:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'lum-gal-6',
    title: 'Protocolo Dermoestético',
    tag: 'Diagnóstico Clínico',
    category: 'Tecnología',
    image_url:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    sort_order: 6,
    is_active: true,
  },
];

function normalizeServiceRow(raw: Record<string, unknown>): Service {
  const priceRaw =
    typeof raw.price_mxn === 'number'
      ? raw.price_mxn
      : typeof raw.price === 'number'
        ? raw.price
        : Number(raw.price_mxn ?? raw.price ?? 0);
  const durRaw =
    typeof raw.duration_min === 'number'
      ? raw.duration_min
      : typeof raw.duration_minutes === 'number'
        ? raw.duration_minutes
        : Number(raw.duration_min ?? raw.duration_minutes ?? 60);

  return {
    id: String(raw.id),
    slug: String(raw.slug ?? raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    category: (['limpieza', 'hidratacion', 'antiedad', 'acne', 'paquetes'].includes(
      String(raw.category ?? ''),
    )
      ? raw.category
      : 'limpieza') as Service['category'],
    benefits: Array.isArray(raw.benefits) ? (raw.benefits as string[]) : [],
    price_mxn: priceRaw,
    duration_min: durRaw,
    icon: String(raw.icon ?? 'sparkles'),
    image_url: raw.image_url ? String(raw.image_url) : null,
    bookable: raw.bookable !== false,
    is_active: raw.is_active !== false,
    is_featured: Boolean(raw.is_featured),
    sort_order: Number(raw.sort_order ?? 0),
  };
}

export async function getServices(): Promise<Service[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data || data.length === 0) return DEFAULT_SERVICES;
    return data.map((r) => normalizeServiceRow(r as Record<string, unknown>));
  } catch {
    return DEFAULT_SERVICES;
  }
}

export async function getBookableServices(): Promise<Service[]> {
  const all = await getServices();
  return all.filter((s) => s.bookable);
}

export async function getFeaturedService(): Promise<Service | null> {
  const all = await getServices();
  return all.find((s) => s.is_featured) ?? all[0] ?? null;
}

export async function getStylists(): Promise<Stylist[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from('stylists')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data || data.length === 0) return DEFAULT_STYLISTS;
    return data as Stylist[];
  } catch {
    return DEFAULT_STYLISTS;
  }
}

export type StylistReviewWithStylist = StylistReview & { stylistName: string };

export async function getRecentReviews(limit = 6): Promise<StylistReviewWithStylist[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from('stylist_reviews')
      .select('*, stylists(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    type Row = StylistReview & { stylists: { name: string } | null };
    return ((data as Row[] | null) ?? []).map((r) => ({
      ...r,
      stylistName: r.stylists?.name ?? 'Especialista Lumière',
    }));
  } catch {
    return [];
  }
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from('business_hours')
      .select('*')
      .order('day_of_week');
    if (error || !data || data.length === 0) return DEFAULT_HOURS;
    return data as BusinessHour[];
  } catch {
    return DEFAULT_HOURS;
  }
}

export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data || data.length === 0) return DEFAULT_GALLERY;
    return data as GalleryItem[];
  } catch {
    return DEFAULT_GALLERY;
  }
}

export interface MyBooking {
  id: string;
  reference: string;
  starts_at: string;
  ends_at: string;
  status: 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  notes: string;
  service_id: string;
  service_ids: string[] | null;
  stylist_id: string | null;
  services: { name: string; price_mxn: number; duration_min: number } | null;
  stylists: { name: string } | null;
}

export async function getMyBookings(userId: string, _email: string | null): Promise<MyBooking[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from('bookings')
      .select('*, services(name, price_mxn, duration_min), stylists(name)')
      .eq('user_id', userId)
      .order('starts_at', { ascending: false });
    return (data as unknown as MyBooking[]) ?? [];
  } catch {
    return [];
  }
}
