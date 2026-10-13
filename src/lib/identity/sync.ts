import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { stylistPatch, profilePatch, metadataPatch, type IdentityChange } from './patch';

function revalidateIdentitySurfaces() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/stylists');
  revalidatePath('/staff/account');
}

export async function syncProfileToStylist(stylistId: string, change: IdentityChange): Promise<void> {
  try {
    const patch = stylistPatch(change);
    if (Object.keys(patch).length === 0) return;
    const admin = createAdminClient();
    const { error } = await admin.from('stylists').update(patch).eq('id', stylistId);
    if (error) throw error;
    revalidateIdentitySurfaces();
  } catch (err) {
    console.error('[identity-sync] profile → stylist failed:', err);
  }
}

export async function syncStylistToProfiles(stylistId: string, change: IdentityChange): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: linked } = await admin.from('profiles').select('id').eq('stylist_id', stylistId);
    if (!linked || linked.length === 0) return;

    const pPatch = profilePatch(change);
    if (Object.keys(pPatch).length > 0) {
      const { error } = await admin.from('profiles').update(pPatch).eq('stylist_id', stylistId);
      if (error) throw error;
    }

    const mPatch = metadataPatch(change);
    if (Object.keys(mPatch).length > 0) {
      for (const row of linked) {
        const { error } = await admin.auth.admin.updateUserById(row.id, { user_metadata: mPatch });
        if (error) throw error;
      }
    }
    revalidateIdentitySurfaces();
  } catch (err) {
    console.error('[identity-sync] stylist → profiles failed:', err);
  }
}
