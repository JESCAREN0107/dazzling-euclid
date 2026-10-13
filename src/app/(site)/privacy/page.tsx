import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/legal-page';
import { getSiteContent } from '@/lib/content/get';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad · Lumière Skin & Spa',
  description:
    'Conoce cómo Lumière Skin & Spa recopila, protege y utiliza tus datos personales para gestionar tus citas y tratamientos.',
};

export default async function PrivacyPage() {
  const contact = await getSiteContent('contact');

  return (
    <LegalPage
      kicker="Privacidad y Protección de Datos"
      title="Aviso de Privacidad"
      lead="En Lumière Skin & Spa respetamos tu privacidad y protegemos tu información personal con apego a la legislación mexicana aplicable."
      updated="Octubre 2026"
      sections={[
        {
          id: 'datos-recopilados',
          heading: '1. Datos personales que recopilamos',
          body: (
            <p>
              En Lumière Skin &amp; Spa recopilamos únicamente los datos necesarios para agendar y
              brindarte nuestros tratamientos de bienestar: nombre completo, número telefónico,
              correo electrónico (opcional al reservar sin cuenta) y notas o preferencias que
              decidas compartir sobre tu piel o sensibilidad corporal.
            </p>
          ),
        },
        {
          id: 'finalidad',
          heading: '2. Finalidad del tratamiento de datos',
          body: (
            <p>
              Utilizamos tu información exclusivamente para confirmar, reprogramar o dar seguimiento
              a tus citas, asignarte al especialista adecuado en cabina y enviarte avisos
              relacionados con tu reservación. No vendemos, alquilamos ni compartimos tu información
              personal con terceros con fines publicitarios.
            </p>
          ),
        },
        {
          id: 'seguridad',
          heading: '3. Almacenamiento y seguridad',
          body: (
            <p>
              Tus datos se resguardan mediante infraestructura segura en Supabase con políticas de
              seguridad a nivel de fila (Row Level Security) y controles de acceso por rol para que
              únicamente el personal autorizado del spa pueda consultar la agenda operativa.
            </p>
          ),
        },
        {
          id: 'derechos-arco',
          heading: '4. Derechos ARCO y eliminación de cuenta',
          body: (
            <p>
              Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos
              personales en cualquier momento. Si creaste una cuenta de cliente, puedes actualizar
              tu perfil o eliminar tu cuenta directamente desde tu panel, o bien solicitárnoslo por
              correo en <strong>{contact.email}</strong> o al teléfono{' '}
              <strong>{contact.phone}</strong>.
            </p>
          ),
        },
      ]}
    />
  );
}
