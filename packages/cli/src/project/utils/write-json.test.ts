import { describe, expect, it } from 'bun:test';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeJSON } from './write-json';

describe('writeJSON', () => {
  it('writes formatted JSON files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-write-json-'));
    const filePath = join(dir, 'config.json');

    await writeJSON(filePath, { apps: { api: { entry: 'apps/api.ts' } } });

    const data = await readFile(filePath, 'utf-8');

    expect(data).toBe(`{
  "apps": {
    "api": {
      "entry": "apps/api.ts"
    }
  }
}`);
  });
});
