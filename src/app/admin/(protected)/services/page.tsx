import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { ServicesList } from './services-list';
import type { Service } from '@/lib/supabase/types';

export default async function ServicesPage() {
  await requireRole(['admin'], '/admin/services');
  const sb = await createClient();
  const { data: services, error } = await sb.from('services').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1 className="ahead__title">Tratamientos y Precios</h1>
        </div>
        <Link href="/#services" target="_blank" className="btn btn--ghost">
          Ver en el sitio ↗
        </Link>
      </div>
      <LoadError what="tratamientos" error={error} />
      <ServicesList services={(services ?? []) as Service[]} />
    </div>
  );
}
