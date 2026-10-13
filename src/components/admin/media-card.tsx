'use client';
import { useState, type ReactNode } from 'react';

export interface CardBadge {
  label: string;
  tone?: 'gold' | 'muted' | 'hidden';
}

export function CardImg({
  src,
  fallbackSrc,
  alt = '',
}: {
  src: string;
  fallbackSrc?: string;
  alt?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = failedSrc === src;
  const active = broken && fallbackSrc ? fallbackSrc : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={active}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (!broken && fallbackSrc && src !== fallbackSrc) setFailedSrc(src);
      }}
    />
  );
}

export function MediaCard({
  media,
  title,
  subtitle,
  meta,
  description,
  chips,
  badges,
  children,
}: {
  media: { src: string; fallbackSrc?: string; alt?: string; aspect?: 'wide' | 'square' };
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  description?: string;
  chips?: string[];
  badges?: CardBadge[];
  children?: ReactNode;
}) {
  const aspect = media.aspect ?? 'wide';
  return (
    <li className="mcard">
      <div className={`mcard__media mcard__media--${aspect}`}>
        <CardImg src={media.src} fallbackSrc={media.fallbackSrc} alt={media.alt ?? ''} />
        {badges && badges.length > 0 && (
          <div className="mcard__badges">
            {badges.map((b) => (
              <span key={b.label} className={`mbadge mbadge--${b.tone ?? 'muted'}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mcard__body">
        <div className="mcard__title">{title}</div>
        {subtitle && <div className="mcard__sub">{subtitle}</div>}
        {meta && <div className="mcard__meta">{meta}</div>}
        {description && <p className="mcard__desc">{description}</p>}
        {chips && chips.length > 0 && (
          <div className="mcard__chips">
            {chips.map((c) => (
              <span key={c} className="mchip">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {children && <div className="mcard__foot">{children}</div>}
    </li>
  );
}
