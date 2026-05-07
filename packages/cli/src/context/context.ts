import { resolve } from 'node:path';
import type { Class } from '@bunito/common';
import yargs from 'yargs';
import { ROOT_PATH, takeFirst } from '../common';
import type { ContextService, ContextServices, ContextSettings } from './types';

export class Context {
  private settingsLoaded: ContextSettings | undefined;

  constructor(
    private readonly services: ContextServices = {},
    settings?: ContextSettings | undefined,
  ) {
    this.settingsLoaded = settings;
  }

  get settings(): ContextSettings {
    if (!this.settingsLoaded) {
      throw new Error('Context settings not loaded');
    }

    return this.settingsLoaded;
  }

  get cli(): ContextService<'cli'> {
    return this.getService('cli');
  }

  get fs(): ContextService<'fs'> {
    return this.getService('fs');
  }

  get logger(): ContextService<'logger'> {
    return this.getService('logger');
  }

  get project(): ContextService<'project'> {
    return this.getService('project');
  }

  get spawn(): ContextService<'spawn'> {
    return this.getService('spawn');
  }

  async loadSettings(
    cwd: string,
    argv: string[],
    options: Partial<ContextSettings> = {},
  ): Promise<void> {
    const pkgInfo = await this.fs.readPkgInfo(ROOT_PATH);

    if (!pkgInfo) {
      return null as never;
    }

    const {
      version: pkgVersion,
      engines: { bun: bunVersion },
    } = pkgInfo;

    const { cwd: cwdArgv, debug } = await yargs(argv)
      .option({
        cwd: {
          type: 'string',
          alias: 'C',
          coerce: takeFirst<string>,
        },
        debug: {
          type: 'boolean',
          alias: 'd',
          default: false,
        },
      })
      .parse();

    this.settingsLoaded = {
      ...options,
      cwd: cwdArgv ? resolve(cwd, cwdArgv) : cwd,
      argv,
      bunVersion,
      pkgVersion: pkgVersion && !debug ? pkgVersion : 'workspace:*',
      debug,
    };
  }

  createService<
    TName extends keyof ContextServices,
    TService extends ContextService<TName>,
  >(name: TName, serviceClass: Class<TService, [Context]>): this {
    this.services[name] = new serviceClass(this);
    return this;
  }

  setService<TName extends keyof ContextServices, TService extends ContextService<TName>>(
    name: TName,
    service: TService,
  ): this {
    this.services[name] = service;
    return this;
  }

  private getService<TName extends keyof ContextServices>(
    name: TName,
  ): ContextService<TName> {
    const service = this.services[name];

    if (service === undefined) {
      throw new Error(`Service ${name} not found`);
    }

    return service as ContextService<TName>;
  }
}
