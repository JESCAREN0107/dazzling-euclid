export function safeNext(next: string | undefined | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  if (/[\x00-\x1f\\]/.test(next) || next.includes(':')) return null;
  try {
    if (new URL(next, 'http://x.invalid').origin !== 'http://x.invalid') return null;
  } catch {
    return null;
  }
  return next;
}
