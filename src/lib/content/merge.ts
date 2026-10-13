import { blockSchemas, type BlockKey } from '@/lib/content/blocks';
import type { z } from 'zod';

export type BlockOut<K extends BlockKey> = z.infer<(typeof blockSchemas)[K]>;

export function mergeContent<K extends BlockKey>(key: K, value: unknown): BlockOut<K> {
  const schema = blockSchemas[key];
  if (value && typeof value === 'object') {
    const parsed = schema.safeParse(value);
    if (parsed.success) return parsed.data as BlockOut<K>;
  }
  const fallback = schema.safeParse({});
  if (fallback.success) return fallback.data as BlockOut<K>;

  // Fallback garantizado ante cualquier estructura inesperada
  return schema.parse({}) as BlockOut<K>;
}
