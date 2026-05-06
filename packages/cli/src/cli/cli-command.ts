import type { RawObject } from '@bunito/common';
import type { CLI } from './cli';

export abstract class CLICommand<TOptions extends RawObject> {
  constructor(
    protected readonly options: TOptions,
    protected readonly cli: CLI,
  ) {}

  protected get logger(): CLI['logger'] {
    return this.cli.logger;
  }

  protected get fs(): CLI['fs'] {
    return this.cli.fs;
  }

  protected get project(): CLI['project'] {
    return this.cli.project;
  }

  abstract run(): Promise<void>;
}
