export function makeReference(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `LUM-${s}`;
}
