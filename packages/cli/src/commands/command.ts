import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import * as process from 'node:process';
import type { ZodObject, z } from 'zod';
import { APP_MAIN, APPS_ROOT } from '../constants';
import { CliException } from '../exceptions';
import type { AppInfo } from '../types';

export abstract class Command<TOptionSchema extends ZodObject = ZodObject> {
  protected options: z.infer<TOptionSchema> = {} as z.infer<TOptionSchema>;

  protected constructor(
    protected readonly optionsSchema: TOptionSchema,
    protected readonly optionsAliases: Record<string, string> = {},
  ) {
    //
  }

  async processArgs(args: string[]): Promise<void> {
    const options = this.prepareOptions(args);

    this.options = await this.optionsSchema.parseAsync(options);
  }

  abstract execute(): Promise<void>;

  protected async readApps(names: string[] = []): Promise<AppInfo[]> {
    const apps: AppInfo[] = [];

    const appsRoot = join(process.cwd(), APPS_ROOT);
    const appsNames = new Set(names);

    if (!appsNames.size) {
      try {
        const dirs = await readdir(appsRoot, {
          withFileTypes: true,
        });

        for (const dir of dirs) {
          if (!dir.isDirectory()) {
            continue;
          }

          appsNames.add(dir.name);
        }
      } catch {
        //
      }
    }

    for (const name of appsNames) {
      try {
        const mainStat = await stat(join(appsRoot, name, APP_MAIN));

        if (!mainStat.isFile()) {
          continue;
        }

        apps.push({
          name,
          main: join(APPS_ROOT, name, APP_MAIN),
        });
      } catch {
        //
      }
    }

    return apps;
  }

  private prepareOptions(args: string[]): Record<string, unknown> {
    let apps: string[] | undefined;

    const options: Record<string, unknown> = {};

    let prevArg: { value: string; key: string } | undefined;

    for (const value of args) {
      if (!value.startsWith('-')) {
        if (prevArg) {
          options[prevArg.key] = value;
          prevArg = undefined;
        } else {
          apps ??= [];
          apps.push(value);
        }

        continue;
      }

      if (prevArg) {
        throw new CliException(`Missing value for ${prevArg.value} argument`);
      }

      let key: string | undefined = value
        .replace(/^-+/, '')
        .replace(/-+([a-zA-Z])/g, (_, char) => char.toUpperCase());

      if (this.optionsAliases[key]) {
        key = this.optionsAliases[key];
      }

      if (!key) {
        throw new CliException(`Invalid ${value} argument`);
      }

      const argShape = this.optionsSchema.shape[key] as z.ZodType | undefined;

      if (!argShape) {
        throw new CliException(`Invalid ${value} argument`);
      }

      if (argShape.toJSONSchema().type === 'boolean') {
        options[key] = true;
        continue;
      }

      prevArg = { value, key };
    }

    if (prevArg) {
      options[prevArg.key] = undefined;
    }

    if (apps) {
      options.apps = apps;
    }

    return options;
  }
}
