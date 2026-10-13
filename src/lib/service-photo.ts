import type { Service } from '@/lib/supabase/types';

type PhotoInput = Pick<Service, 'image_url' | 'category' | 'slug' | 'name' | 'icon'>;
type Photo =
  | { type: 'img'; src: string; fallbackSrc?: string }
  | { type: 'icon' };

const CATEGORY_PHOTOS: Record<string, string> = {
  limpieza:
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
  hidratacion:
    'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=900&q=85',
  antiedad:
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85',
  acne:
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
  paquetes:
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85',
};

const SLUG_PHOTOS: Record<string, string> = {
  'hidrodermoabrasion-profunda': CATEGORY_PHOTOS.limpieza!,
  'glow-hidrafacial-3-en-1': CATEGORY_PHOTOS.hidratacion!,
  'dermaplaning-oro-24k': CATEGORY_PHOTOS.antiedad!,
  'tratamiento-purificante-anti-acne': CATEGORY_PHOTOS.acne!,
  'lifting-radiofrecuencia-tripolar':
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
  'ritual-reina-lumiere': CATEGORY_PHOTOS.paquetes!,
};

export function serviceImageSrc(
  s: Pick<Service, 'image_url' | 'category'> & { slug?: string },
): string {
  const fallback = CATEGORY_PHOTOS[s.category] ?? CATEGORY_PHOTOS.limpieza!;
  if (typeof s.image_url === 'string' && s.image_url.trim() !== '') {
    return s.image_url;
  }
  const bySlug = s.slug ? SLUG_PHOTOS[s.slug] : undefined;
  return bySlug ?? fallback;
}

export function servicePhoto(s: PhotoInput): Photo {
  const fallback = CATEGORY_PHOTOS[s.category] ?? CATEGORY_PHOTOS.limpieza!;
  const src = serviceImageSrc(s);
  return { type: 'img', src, fallbackSrc: fallback };
}
