import { describe, expect, it } from 'bun:test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readJSON } from './read-json';

describe('readJSON', () => {
  it('reads JSON files and returns undefined for missing files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-read-json-'));
    const filePath = join(dir, 'config.json');

    await Bun.write(filePath, JSON.stringify({ name: 'bunito' }));

    const data = await readJSON<{ name: string }>(filePath);
    const missing = await readJSON(join(dir, 'missing.json'));

    expect(data).toEqual({ name: 'bunito' });
    expect(missing).toBeUndefined();
  });

  it('rejects invalid JSON with the file basename', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-read-json-'));
    const filePath = join(dir, 'broken.json');

    await Bun.write(filePath, '{');

    try {
      await readJSON(filePath);
      throw new Error('Expected readJSON to reject invalid JSON');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Invalid JSON file: broken.json');
    }
  });
});
