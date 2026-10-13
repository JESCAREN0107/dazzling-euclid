export function parseCardInput(role: string, tags: string): { role: string; tags: string[] } {
  return {
    role: role.trim().slice(0, 80),
    tags: tags
      .split(',')
      .map((t) => t.trim().slice(0, 28))
      .filter(Boolean)
      .slice(0, 6),
  };
}

export function cardNeedsSetup(card: { role: string; is_active: boolean }): boolean {
  return !card.is_active && card.role.trim() === '';
}
