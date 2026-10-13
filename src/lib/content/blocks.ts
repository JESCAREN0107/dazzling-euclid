import { z } from 'zod';

const str = (fallback: string, max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .default(fallback)
    .transform((v) => v || fallback);

export const heroSchema = z.object({
  eyebrow: str('Clínica Dermoestética & Spa · Río Bravo / Reynosa, Tamps.', 100),
  title_line1: str('El arte de resaltar', 60),
  title_accent: str('la luminosidad natural', 60),
  title_line2: str('de tu piel.', 60),
  lead: str(
    'Tratamientos faciales clínicos personalizados, hidrodermoabrasión, lifting sin cirugía y rituales botánicos diseñados por especialistas en salud de la piel.',
    340,
  ),
  cta_primary: str('Agendar mi cita', 40),
  cta_secondary: str('Explorar tratamientos', 40),
});

export const storySchema = z.object({
  eyebrow: str('Nuestra Filosofía', 60),
  heading: str('Ciencia dermoestética y bienestar sensorial en cada sesión.', 120),
  body1: str(
    'En Lumière Skin & Spa combinamos aparatología clínica de vanguardia con activos dermatológicos de grado médico para transformar la salud de tu piel desde la primera visita.',
    500,
  ),
  body2: str(
    'Cada protocolo inicia con una valoración personalizada de tu biotipo cutáneo en un santuario privado, cálido y libre de prisas.',
    500,
  ),
  quote: str(
    'Tu piel es única; tu tratamiento facial también debe serlo.',
    220,
  ),
});

const statTile = (n: string, l: string) =>
  z.object({
    n: str(n, 20),
    l: str(l, 60),
  });

export const statsSchema = z.object({
  s1: statTile('6+', 'Protocolos Dermoestéticos'),
  s2: statTile('100%', 'Atención Personalizada'),
  s3: statTile('Grado Médico', 'Activos & Aparatología'),
  s4: statTile('Matamoros / Río Bravo', 'Zona Horaria Fronteriza'),
});

export const ctaSchema = z.object({
  eyebrow: str('Promoción de Temporada · Reserva en Línea', 80),
  heading: str('Regálale a tu piel el cuidado clínico que merece hoy.', 120),
  sub: str(
    'Agenda en menos de un minuto eligiendo tu tratamiento, especialista, fecha y horario disponible con confirmación inmediata.',
    260,
  ),
  button: str('Reservar cita ahora', 40),
});

export const contactSchema = z.object({
  address: str('Av. Francisco I. Madero, Zona Centro · Río Bravo / Reynosa, Tamaulipas', 180),
  landmark: str('Estacionamiento privado frente a la clínica · Acceso climatizado', 160),
  phone: str('+52 899 527 6969', 40),
  email: str('citas@lumierespa.mx', 80),
  hours_note: str('Martes a Sábado 9:00 AM – 7:00 PM · Domingo 10:00 AM – 3:00 PM · Lunes cerrado', 160),
  map_url: str('https://maps.google.com/?q=25.983294863816297,-98.10022678386305', 300),
  instagram: str('https://instagram.com/lumiereskinspa', 200),
  facebook: str('https://facebook.com/lumiereskinspa', 200),
});

export const quoteSchema = z.object({
  text: str(
    'Cuidar tu piel no es un lujo pasajero: es una inversión diaria en tu confianza, salud y bienestar.',
    280,
  ),
  attribution: str('Equipo Clínico · Lumière Skin & Spa', 100),
});

const DEFAULT_FAQS = [
  {
    q: '¿Necesito saber qué tratamiento elegir antes de reservar?',
    a: 'No te preocupes. Puedes reservar el tratamiento que más llame tu atención (como nuestra Limpieza Facial Profunda) y al llegar realizamos un diagnóstico dermoestético sin costo para adaptar los activos a lo que tu piel necesita ese día.',
  },
  {
    q: '¿Cómo funciona la protección contra citas duplicadas?',
    a: 'Nuestro sistema bloquea en tiempo real los horarios ocupados de cada especialista considerando la duración exacta de tu tratamiento. Así garantizamos que tu cabina y especialista estén listas exclusivamente para ti.',
  },
  {
    q: '¿Puedo elegir a mi especialista o reservar varios tratamientos?',
    a: 'Sí. En el asistente de reserva puedes seleccionar uno o varios tratamientos para una misma visita y elegir a tu especialista preferida o seleccionar "Cualquier especialista disponible".',
  },
  {
    q: '¿Qué métodos de pago aceptan y qué moneda manejan?',
    a: 'Todos nuestros precios están expresados en Pesos Mexicanos (MXN). Aceptamos efectivo, tarjetas de crédito/débito y transferencia bancaria SPEI en recepción.',
  },
  {
    q: '¿Con cuánta anticipación puedo reprogramar o cancelar mi cita?',
    a: 'Te pedimos avisarnos o reprogramar desde tu cuenta con al menos 12 horas de anticipación para liberar el espacio en agenda.',
  },
];

export const faqsSchema = z.object({
  items: z
    .array(
      z.object({
        q: z.string().trim().min(1).max(200),
        a: z.string().trim().min(1).max(600),
      }),
    )
    .min(1)
    .max(12)
    .default(DEFAULT_FAQS),
});

export const blockSchemas = {
  hero: heroSchema,
  story: storySchema,
  stats: statsSchema,
  cta: ctaSchema,
  contact: contactSchema,
  quote: quoteSchema,
  faqs: faqsSchema,
} as const;

export type BlockKey = keyof typeof blockSchemas;
export type HeroContent = z.infer<typeof heroSchema>;
export type StoryContent = z.infer<typeof storySchema>;
export type StatsContent = z.infer<typeof statsSchema>;
export type CtaContent = z.infer<typeof ctaSchema>;
export type ContactContent = z.infer<typeof contactSchema>;
export type QuoteContent = z.infer<typeof quoteSchema>;
export type FaqsContent = z.infer<typeof faqsSchema>;
