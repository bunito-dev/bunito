import type { Stats } from 'node:fs';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export class FS {
  getFile(path: string, ...paths: string[]): Bun.BunFile {
    return Bun.file(join(path, ...paths));
  }

  async readDir(path: string, ...paths: string[]): Promise<string[] | undefined> {
    const stats = await this.getStats(path, ...paths);

    if (!stats?.isDirectory()) {
      return;
    }

    return readdir(join(path, ...paths));
  }

  async getStats(path: string, ...paths: string[]): Promise<Stats | undefined> {
    return await stat(join(path, ...paths)).catch(() => undefined);
  }

  async ensurePath(path: string, ...paths: string[]): Promise<void> {
    await mkdir(join(path, ...paths), { recursive: true });
  }
}
