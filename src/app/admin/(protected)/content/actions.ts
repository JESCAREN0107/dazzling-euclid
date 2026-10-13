'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { blockSchemas, type BlockKey } from '@/lib/content/blocks';

type Result = { ok: true } | { error: string };
const PATH = '/admin/content';
const KEYS = Object.keys(blockSchemas) as BlockKey[];

function readBlock(key: BlockKey, fd: FormData): Record<string, unknown> {
  if (key === 'quote') {
    return {
      text: fd.get('text') ?? '',
      attribution: fd.get('attribution') ?? '',
    };
  }
  if (key === 'cta') {
    return {
      eyebrow: fd.get('eyebrow') ?? '',
      heading: fd.get('heading') ?? '',
      sub: fd.get('sub') ?? '',
      button: fd.get('button') ?? '',
    };
  }
  if (key === 'hero') {
    return {
      eyebrow: fd.get('eyebrow') ?? '',
      title_line1: fd.get('title_line1') ?? '',
      title_accent: fd.get('title_accent') ?? '',
      title_line2: fd.get('title_line2') ?? '',
      lead: fd.get('lead') ?? '',
      cta_primary: fd.get('cta_primary') ?? '',
      cta_secondary: fd.get('cta_secondary') ?? '',
    };
  }
  if (key === 'stats') {
    return {
      s1: { n: fd.get('s1_n') ?? '', l: fd.get('s1_l') ?? '' },
      s2: { n: fd.get('s2_n') ?? '', l: fd.get('s2_l') ?? '' },
      s3: { n: fd.get('s3_n') ?? '', l: fd.get('s3_l') ?? '' },
      s4: { n: fd.get('s4_n') ?? '', l: fd.get('s4_l') ?? '' },
    };
  }
  if (key === 'contact') {
    return {
      address: fd.get('address') ?? '',
      landmark: fd.get('landmark') ?? '',
      phone: fd.get('phone') ?? '',
      email: fd.get('email') ?? '',
      hours_note: fd.get('hours_note') ?? '',
      map_url: fd.get('map_url') ?? '',
      instagram: fd.get('instagram') ?? '',
      facebook: fd.get('facebook') ?? '',
    };
  }
  // story
  return {
    eyebrow: fd.get('eyebrow') ?? '',
    heading: fd.get('heading') ?? '',
    body1: fd.get('body1') ?? '',
    body2: fd.get('body2') ?? '',
    quote: fd.get('quote') ?? '',
  };
}

export async function saveBlock(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const key = String(fd.get('key') ?? '') as BlockKey;
  if (!KEYS.includes(key)) return { error: 'Bloque de contenido desconocido' };

  const parsed = blockSchemas[key].safeParse(readBlock(key, fd));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const sb = await createClient();
  const { error } = await sb
    .from('site_content')
    .upsert(
      { key, value: parsed.data, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
  if (error) return { error: error.message };

  revalidatePath(PATH);
  revalidatePath('/');
  return { ok: true };
}
