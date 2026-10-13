const DICEBEAR_STYLE = 'lorelei';
const DICEBEAR_HOST = 'api.dicebear.com';
const DICEBEAR_BASE = `https://${DICEBEAR_HOST}/9.x/${DICEBEAR_STYLE}/svg`;

function httpHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.hostname : null;
  } catch {
    return null;
  }
}

export function dicebearUrl(seed: string | null | undefined): string {
  const s = (seed ?? '').trim() || 'lumiere';
  const params = new URLSearchParams({
    seed: s,
    backgroundType: 'gradientLinear',
    backgroundColor: 'b87d64,9c624b',
  });
  return `${DICEBEAR_BASE}?${params.toString()}`;
}

export interface UserMetadata {
  avatar_url?: string | null;
  custom_avatar_url?: string | null;
  email_avatar_url?: string | null;
  avatar_choice?: 'custom' | 'dicebear' | 'email' | null;
  dicebear_seed?: string | null;
  picture?: string | null;
  [key: string]: unknown;
}

export function getAvatarInfo(
  userMetadata: UserMetadata | null | undefined,
  seed: string | null | undefined,
) {
  const meta = userMetadata || {};
  const dicebearSeed = meta.dicebear_seed || seed;

  let customAvatar = meta.custom_avatar_url || null;
  const currentAvatarUrl = meta.avatar_url;
  if (currentAvatarUrl && currentAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
    customAvatar = currentAvatarUrl;
  }

  let emailAvatar = meta.picture || meta.email_avatar_url || null;
  const avatarHost = httpHost(currentAvatarUrl);
  if (
    currentAvatarUrl &&
    avatarHost &&
    !currentAvatarUrl.includes('/storage/v1/object/public/avatars/') &&
    avatarHost !== DICEBEAR_HOST
  ) {
    emailAvatar = currentAvatarUrl;
  }

  let choice = meta.avatar_choice;
  if (choice === 'email' && !emailAvatar) choice = 'dicebear';
  if (choice === 'custom' && !customAvatar) choice = 'dicebear';
  if (!choice) {
    if (customAvatar) choice = 'custom';
    else if (emailAvatar) choice = 'email';
    else choice = 'dicebear';
  }

  let src = dicebearUrl(dicebearSeed);
  if (choice === 'custom' && customAvatar) src = customAvatar;
  else if (choice === 'email' && emailAvatar) src = emailAvatar;

  return {
    choice: choice as 'custom' | 'email' | 'dicebear',
    customAvatar: customAvatar as string | null,
    emailAvatar: emailAvatar as string | null,
    src,
  };
}

export function avatarSrc(
  uploadedOrMetadata: UserMetadata | string | null | undefined,
  seed: string | null | undefined,
): string {
  if (uploadedOrMetadata && typeof uploadedOrMetadata === 'object') {
    return getAvatarInfo(uploadedOrMetadata, seed).src;
  }
  const u = (uploadedOrMetadata ?? '').trim();
  if (!u || u === 'null' || u === 'undefined') {
    return dicebearUrl(seed);
  }
  return u;
}
