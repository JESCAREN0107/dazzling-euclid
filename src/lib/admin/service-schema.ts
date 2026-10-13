import { z } from 'zod';

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const numberFromForm = z.coerce.number();

export const serviceInputSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre del tratamiento es obligatorio'),
    slug: z.string().trim().default(''),
    description: z.string().trim().max(400).default(''),
    category: z.enum(['limpieza', 'hidratacion', 'antiedad', 'acne', 'paquetes']),
    benefits: z.string().default(''),
    price_mxn: numberFromForm.int().min(0, 'El precio no puede ser negativo'),
    duration_min: numberFromForm.int().positive('La duración debe ser mayor a 0 minutos'),
    icon: z.string().trim().min(1).default('sparkles'),
    image_url: z.string().trim().default(''),
    bookable: z.coerce.boolean().default(true),
    is_active: z.coerce.boolean().default(true),
    is_featured: z.coerce.boolean().default(false),
    sort_order: numberFromForm.int().default(0),
  })
  .transform((v) => ({
    name: v.name,
    slug: v.slug ? slugify(v.slug) : slugify(v.name),
    description: v.description,
    category: v.category,
    benefits: v.benefits
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean),
    price_mxn: v.price_mxn,
    duration_min: v.duration_min,
    icon: v.icon,
    image_url: v.image_url === '' ? null : v.image_url,
    bookable: v.bookable,
    is_active: v.is_active,
    is_featured: v.is_featured,
    sort_order: v.sort_order,
  }));
