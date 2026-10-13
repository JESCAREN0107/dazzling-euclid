'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { serviceInputSchema } from '@/lib/admin/service-schema';

type Result = { ok: true } | { error: string };
const PATH = '/admin/services';

function parseForm(fd: FormData) {
  return serviceInputSchema.safeParse({
    name: fd.get('name') ?? '',
    slug: fd.get('slug') ?? '',
    description: fd.get('description') ?? '',
    category: fd.get('category') ?? 'limpieza',
    benefits: fd.get('benefits') ?? '',
    price_mxn: fd.get('price_mxn') ?? '',
    duration_min: fd.get('duration_min') ?? '',
    icon: fd.get('icon') ?? 'sparkles',
    image_url: fd.get('image_url') ?? '',
    bookable: fd.get('bookable') ? 'true' : '',
    is_active: fd.get('is_active') ? 'true' : '',
    is_featured: fd.get('is_featured') ? 'true' : '',
    sort_order: fd.get('sort_order') ?? '0',
  });
}

function revalidate() {
  revalidatePath(PATH);
  revalidatePath('/');
}

export async function createService(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const parsed = parseForm(fd);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const sb = await createClient();
  const { error } = await sb.from('services').insert(parsed.data);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateService(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Falta el ID del tratamiento' };
  const parsed = parseForm(fd);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const sb = await createClient();
  const { error } = await sb.from('services').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteService(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Falta el ID del tratamiento' };
  const sb = await createClient();
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
