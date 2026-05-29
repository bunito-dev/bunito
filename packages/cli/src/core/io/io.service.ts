import { cp, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Provider } from '@bunito/container';
import { input } from '@inquirer/prompts';
import { ProcessService } from '../process';
import { PKG_INFO_FILE, PKG_INFO_SCHEMA } from './constants';
import type { File, PkgInfo } from './types';
@Provider({
  injects: [ProcessService, null],
})
export class IOService {
  constructor(
    private readonly processService: ProcessService,
    private readonly prompt = input,
  ) {}

  getFile(path: string, ...paths: string[]): File {
    const file = Bun.file(join(path, ...paths)) as File;

    const write = file.write.bind(file);

    file.write = async (...args: Parameters<File['write']>) => {
      if (this.processService.readonly) {
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

  async copyPaths(srcPath: string, destPath: string): Promise<void> {
    await cp(srcPath, destPath, {
      recursive: true,
    });
  }

  async readDir(path: string, ...paths: string[]): Promise<File[] | undefined> {
    const file = this.getFile(path, ...paths);

    if (!(await file.tryStat())?.isDirectory()) {
      return;
    }

    const files: File[] = [];
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
    if (this.processService.readonly) {
      return;
    }

    await mkdir(join(path, ...paths), { recursive: true });
  }

  async readInput(options: Parameters<typeof input>[0]): Promise<string> {
    return this.prompt(options);
  }
}
