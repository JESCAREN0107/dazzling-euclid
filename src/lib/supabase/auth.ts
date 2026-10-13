import { redirect } from 'next/navigation';
import { createClient } from './server';
import type { Role } from '@/lib/auth/roles';

export type { Role };

export interface Profile {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  stylistId: string | null;
}

export async function getUser() {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;

    const { data } = await sb
      .from('profiles')
      .select('id, full_name, email, phone, role, stylist_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!data) {
      return {
        id: user.id,
        fullName:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
        email: user.email ?? null,
        phone: null,
        role: 'user',
        stylistId: null,
      };
    }

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email ?? user.email ?? null,
      phone: data.phone ?? null,
      role: (data.role as Role) ?? 'user',
      stylistId: data.stylist_id,
    };
  } catch {
    return null;
  }
}

export async function requireRole(allowed: Role[], nextPath = '/'): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (!allowed.includes(profile.role)) {
    if (profile.role === 'staff') redirect('/staff');
    if (profile.role === 'admin') redirect('/admin');
    redirect('/');
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole(['admin'], '/admin');
}
