import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/auth';
import { routeForRole } from '@/lib/auth/roles';

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  redirect(routeForRole(profile.role));
}
