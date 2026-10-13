import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { GalleryList } from './gallery-list';

export default async function GalleryPage() {
  await requireRole(['admin'], '/admin/gallery');
  const sb = await createClient();
  const { data: items, error } = await sb.from('gallery').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Portafolio Visual</span>
          <h1 className="ahead__title">Galería</h1>
        </div>
        <Link href="/#looks" target="_blank" className="btn btn--ghost">
          Ver en el sitio ↗
        </Link>
      </div>
      <LoadError what="galería" error={error} />
      <GalleryList items={items ?? []} />
    </div>
  );
}
