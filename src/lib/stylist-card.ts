import { dicebearUrl } from '@/lib/avatar';

const SPECIALIST_FALLBACKS: Record<string, string> = {
  'sofia-navarro':
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
  'valeria-morales':
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
};

export function stylistAvatarSrc(stylist: {
  slug: string;
  name: string;
  avatar_url: string | null;
}): string {
  const url = (stylist.avatar_url ?? '').trim();
  if (url !== '') return url;
  if (stylist.slug && SPECIALIST_FALLBACKS[stylist.slug]) {
    return SPECIALIST_FALLBACKS[stylist.slug]!;
  }
  return dicebearUrl(stylist.slug || stylist.name);
}

export function ratingLabel(
  rating: number | null,
  count: number,
): { stars: string; reviews: string | null } {
  if (rating != null && count > 0) {
    return {
      stars: `★ ${Number(rating).toFixed(1)}`,
      reviews: `(${count} ${count === 1 ? 'reseña' : 'reseñas'})`,
    };
  }
  return { stars: '★ Especialista Certificada', reviews: null };
}
