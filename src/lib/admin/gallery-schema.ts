import { z } from 'zod';

export const galleryInputSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  tag: z.string().trim().default(''),
  category: z.string().trim().default(''),
  image_url: z.string().trim().min(1, 'La URL de la imagen es obligatoria'),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.coerce.boolean().default(true),
});
