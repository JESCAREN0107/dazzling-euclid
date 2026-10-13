import { z } from 'zod';

/**
 * Valida números telefónicos de México (10 dígitos, o con prefijo +52 / 52 / 1)
 * e internacionales de 10 a 15 dígitos. Normaliza a 10 dígitos nacionales
 * cuando empieza con 52 y tiene 12 dígitos.
 */
export const mxPhone = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s\-().+]/g, ''))
  .refine(( digits ) => /^\d{10,15}$/.test(digits), {
    message: 'Ingresa un número de teléfono válido de 10 dígitos (ej. 899 527 6969)',
  })
  .transform((digits) => {
    if (digits.length === 12 && digits.startsWith('52')) {
      return digits.slice(2);
    }
    if (digits.length === 13 && digits.startsWith('521')) {
      return digits.slice(3);
    }
    return digits;
  });

export const bookingInputSchema = z.object({
  serviceIds: z.array(z.string().min(1)).min(1, 'Selecciona al menos un tratamiento').max(6),
  stylistId: z.string().min(1).nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Selecciona un horario disponible'),
  customerName: z
    .string()
    .trim()
    .min(2, 'Por favor ingresa tu nombre completo')
    .max(120, 'El nombre es demasiado largo'),
  customerPhone: mxPhone,
  customerEmail: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido')
    .or(z.literal(''))
    .transform((v) => (v === '' ? null : v)),
  notes: z.string().trim().max(500).default(''),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
