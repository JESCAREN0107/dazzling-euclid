'use client';

import { useState } from 'react';
import Image from 'next/image';

export function getFallbackImage(src: string | null | undefined, alt: string): string | null {
  if (src && src.trim() !== '') {
    return src;
  }

  const name = alt.toLowerCase();

  if (name.includes('sofía') || name.includes('sofia')) {
    return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=80';
  }
  if (name.includes('valeria')) {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80';
  }

  if (name.includes('paso 1') || name.includes('agenda')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('paso 2') || name.includes('diagnóstico') || name.includes('valoración')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('paso 3') || name.includes('preparación')) {
    return 'https://images.unsplash.com/photo-1512290900672-1f04d660c45f?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('paso 4') || name.includes('protocolo') || name.includes('activo')) {
    return 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('paso 5') || name.includes('luminosidad') || name.includes('sellado')) {
    return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80';
  }

  if (name.includes('interior') || name.includes('cabina') || name.includes('spa')) {
    return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85';
  }

  if (name.includes('mapa') || name.includes('ubicación')) {
    return 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80';
  }

  return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85';
}

export function ImgSlot({
  src,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 980px) 100vw, 33vw',
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageSrc = getFallbackImage(src, alt);

  if (!imageSrc) {
    return (
      <div className={`img-slot img-slot--empty ${className ?? ''}`} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }

  const reveal = priority || isLoaded;

  return (
    <div
      className={`img-slot ${className ?? ''}`}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {!reveal && <div className="img-slot__shimmer" />}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        style={{
          objectFit: 'cover',
          opacity: reveal ? 1 : 0,
          transform: reveal ? 'scale(1)' : 'scale(1.03)',
          transition:
            'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}
