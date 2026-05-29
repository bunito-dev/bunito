import { cp, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { Provider } from '@bunito/container';
import { input } from '@inquirer/prompts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { takeFirst } from '../../common';
import { PKG_INFO_FILE, PKG_INFO_SCHEMA } from './constants';
import type { PkgInfo, SystemFile } from './types';

@Provider({
  injects: [null, null, null],
})
export class SystemService {
  readonly cwd: string;

  readonly readonly: boolean;

  constructor(
    readonly argv = hideBin(process.argv),
    cwd = process.cwd(),
    private readonly prompt = input,
  ) {
    const args = yargs(this.argv)
      .help(false)
      .version(false)
      .option({
        cwd: {
          type: 'string',
          alias: 'C',
          coerce: takeFirst<string>,
        },
        readonly: {
          type: 'boolean',
          default: false,
        },
      })
      .parse();

    const parsed: Partial<Awaited<typeof args>> = args instanceof Promise ? {} : args;

    this.cwd = parsed.cwd ?? cwd;
    this.readonly = parsed.readonly ?? false;
  }

  getFile(path: string, ...paths: string[]): SystemFile {
    const file = Bun.file(join(path, ...paths)) as SystemFile;

    const write = file.write.bind(file);

    file.write = async (...args: Parameters<SystemFile['write']>) => {
      if (this.readonly) {
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

  async readDir(path: string, ...paths: string[]): Promise<SystemFile[] | undefined> {
    const file = this.getFile(path, ...paths);

    if (!(await file.tryStat())?.isDirectory()) {
      return;
    }

    const files: SystemFile[] = [];
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
    if (this.readonly) {
      return;
    }

    await mkdir(join(path, ...paths), { recursive: true });
  }

  async readInput(options: Parameters<typeof input>[0]): Promise<string> {
    return this.prompt(options);
  }
}
