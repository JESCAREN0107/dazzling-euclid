import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAvatarInfo, type UserMetadata } from '@/lib/avatar';

export async function getPeopleAvatarMap(): Promise<Record<string, string>> {
  try {
    const admin = createAdminClient();
    const map: Record<string, string> = {};
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      for (const user of data.users) {
        map[user.id] = getAvatarInfo((user.user_metadata ?? null) as UserMetadata | null, user.email).src;
      }
      if (data.users.length < 200) break;
    }
    return map;
  } catch {
    return {};
  }
}
