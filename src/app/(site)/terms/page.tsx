import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/legal-page';
import { getSiteContent } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Lumière Skin & Spa',
  description:
    'Términos de servicio, políticas de reservación, puntualidad y cancelación de Lumière Skin & Spa.',
};

export default async function TermsPage() {
  const contact = await getSiteContent('contact');

  return (
    <LegalPage
      kicker="Políticas del Santuario"
      title="Términos y Condiciones"
      lead="Lineamientos de reservación, puntualidad, higiene y cuidado en cabina para garantizar una experiencia armónica para cada huésped."
      updated="Octubre 2026"
      sections={[
        {
          id: 'reservaciones',
          heading: '1. Reservaciones y puntualidad',
          body: (
            <p>
              Te sugerimos llegar al menos 10 minutos antes de tu cita para realizar tu registro con
              calma y disfrutar de nuestra infusión de bienvenida. En caso de retraso, el tiempo de
              tu ritual podría ajustarse para no afectar las citas posteriores programadas en
              cabina.
            </p>
          ),
        },
        {
          id: 'cancelaciones',
          heading: '2. Cambios y cancelaciones',
          body: (
            <p>
              Si necesitas reprogramar o cancelar tu cita, te pedimos hacerlo con al menos 4 horas
              de anticipación desde tu panel de cliente o comunicándote directamente al{' '}
              <strong>{contact.phone}</strong>. Esto nos permite liberar el espacio para otros
              huéspedes.
            </p>
          ),
        },
        {
          id: 'precios',
          heading: '3. Precios y pagos en MXN',
          body: (
            <p>
              Todos los precios mostrados en nuestro sitio web están expresados en Pesos Mexicanos
              (MXN) e incluyen impuestos aplicables. El pago de tu tratamiento se realiza
              directamente en recepción al concluir tu visita en efectivo, tarjeta bancaria o
              transferencia.
            </p>
          ),
        },
        {
          id: 'salud',
          heading: '4. Condiciones de salud y bienestar',
          body: (
            <p>
              Antes de iniciar cualquier protocolo facial o corporal, es indispensable informar a tu
              especialista sobre alergias, embarazo, tratamientos dermatológicos activos o
              condiciones médicas relevantes para adaptar los activos botánicos y técnicas a tu
              seguridad.
            </p>
          ),
        },
      ]}
    />
  );
}
