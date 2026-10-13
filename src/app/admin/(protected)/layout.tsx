import type { ReactNode } from 'react';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(['admin'], '/admin');
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return (
    <AdminShell profile={profile} userMetadata={user?.user_metadata ?? null}>
      {children}
    </AdminShell>
  );
}
