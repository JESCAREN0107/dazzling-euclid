import { blockSchemas, type BlockKey } from '@/lib/content/blocks';
import type { z } from 'zod';

export type BlockOut<K extends BlockKey> = z.infer<(typeof blockSchemas)[K]>;

export function mergeContent<K extends BlockKey>(key: K, value: unknown): BlockOut<K> {
  const base = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const parsed = blockSchemas[key].safeParse(base);
  return (parsed.success ? parsed.data : blockSchemas[key].parse({})) as BlockOut<K>;
}
