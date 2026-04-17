import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

export async function readJSON<TContent>(
  filePath: string,
): Promise<TContent | undefined> {
  const data = await readFile(filePath, 'utf-8').catch(() => undefined);

  if (data === undefined) {
    return;
  }

  try {
    return JSON.parse(data) as TContent;
  } catch {
    throw new Error(`Invalid JSON file: ${basename(filePath)}`);
  }
}
