import { redirect } from 'next/navigation';
import { safeNext } from '@/lib/auth/redirect';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
}
