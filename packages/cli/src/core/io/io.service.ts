import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { Provider } from '@bunito/container';
import { input } from '@inquirer/prompts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { takeFirst } from '../../common';
import type { File } from './types';

@Provider({
  injects: [null, null, null],
})
export class IOService {
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

    this.cwd = parsed.cwd ? resolve(cwd, parsed.cwd) : cwd;
    this.readonly = parsed.readonly ?? false;
  }

  getFile(path: string, ...paths: string[]): File {
    const file = Bun.file(join(path, ...paths)) as File;

    const write = file.write.bind(file);

    file.write = async (...args: Parameters<File['write']>) => {
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

  async readInput(options: Parameters<typeof input>[0]): Promise<string> {
    return this.prompt(options);
  }
}
