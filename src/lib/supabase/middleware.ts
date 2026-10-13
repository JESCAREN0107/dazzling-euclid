import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login');
  const isStaffRoute = path.startsWith('/staff');

  const redirectWithCookies = (target: URL) => {
    const res = NextResponse.redirect(target);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (isAdminRoute || isStaffRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return redirectWithCookies(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';

    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = role === 'staff' ? '/staff' : '/';
      url.search = '';
      return redirectWithCookies(url);
    }

    if (isStaffRoute && role !== 'staff' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return redirectWithCookies(url);
    }
  }

  return supabaseResponse;
}
