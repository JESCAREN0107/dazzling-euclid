import { describe, expect, it } from 'vitest';
import { blockSchemas, type BlockKey } from '@/lib/content/blocks';
import { mergeContent } from '@/lib/content/merge';

const keys = Object.keys(blockSchemas) as BlockKey[];

describe('bloques de contenido', () => {
  it.each(keys)('los valores por defecto de "%s" son válidos', (key) => {
    expect(blockSchemas[key].safeParse({}).success).toBe(true);
  });

  it.each(keys)('mergeContent("%s") no falla con datos inválidos', (key) => {
    expect(() => mergeContent(key, { basura: 'x'.repeat(5000) })).not.toThrow();
    expect(() => mergeContent(key, null)).not.toThrow();
  });
});
