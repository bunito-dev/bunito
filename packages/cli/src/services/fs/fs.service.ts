import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Context } from '#context';
import { PKG_INFO_FILE, PKG_INFO_SCHEMA } from './constants';
import type { FileExt, PkgInfo } from './types';

export class FSService {
  constructor(private readonly context: Context) {}

  getFile(path: string, ...paths: string[]): FileExt {
    const file = Bun.file(join(path, ...paths)) as FileExt;

    const write = file.write.bind(file);

    file.write = async (...args: Parameters<FileExt['write']>) => {
      if (this.context.settings.readonly) {
        return 0;
      }

      return write(...args);
    };

    Object.defineProperties(file, {
      tryStat: {
        value: () => file.stat().catch(() => undefined),
        writable: false,
      },
      tryJSON: {
        value: () => file.json().catch(() => undefined),
        writable: false,
      },
    });

    return file;
  }

  async readDir(path: string, ...paths: string[]): Promise<FileExt[] | undefined> {
    const file = this.getFile(path, ...paths);

    if (!(await file.tryStat())?.isDirectory()) {
      return;
    }

    const files: FileExt[] = [];
    const names = await readdir(file.name);

    for (const name of names) {
      files.push(this.getFile(file.name, name));
    }

    return files;
  }

  async readPkgInfo(path: string, ...paths: string[]): Promise<PkgInfo | undefined> {
    const file = this.getFile(path, ...paths, PKG_INFO_FILE);
    const fileStats = await file.tryStat();

    if (!fileStats) {
      return;
    }

    if (!fileStats.isFile()) {
      return;
    }

    const fileContent = await file.tryJSON();

    if (!fileContent) {
      return;
    }

    try {
      return PKG_INFO_SCHEMA.parse(fileContent);
    } catch {
      return;
    }
  }

  async ensurePath(path: string, ...paths: string[]): Promise<void> {
    if (this.context.settings.readonly) {
      return;
    }

    await mkdir(join(path, ...paths), { recursive: true });
  }
}
