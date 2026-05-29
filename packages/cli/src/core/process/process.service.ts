import { OnInit, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import yargs from 'yargs';
import { takeFirst } from '../../common';
import { PROCESS_ARGV_ID, PROCESS_CWD_ID } from './constants';
import type { ProcessSettings } from './types';

@Provider({
  injects: [Logger, PROCESS_ARGV_ID, PROCESS_CWD_ID],
})
export class ProcessService {
  private readonly settings: ProcessSettings;

  constructor(
    private readonly logger: Logger,
    argv: string[],
    cwd: string,
  ) {
    this.settings = {
      argv,
      cwd,
    };
  }

  get cwd(): string {
    return this.settings.cwd;
  }

  get argv(): string[] {
    return this.settings.argv;
  }

  get readonly(): boolean {
    return !!this.settings.readonly;
  }

  get debug(): boolean {
    return !!this.settings.debug;
  }

  @OnInit()
  async loadSettings() {
    const { cwd, debug, readonly } = await yargs(this.argv)
      .help(false)
      .version(false)
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
        readonly: {
          type: 'boolean',
          default: false,
        },
      })
      .parse();

    if (cwd) {
      this.settings.cwd = cwd;
    }

    if (debug) {
      this.settings.debug = true;
    }

    if (readonly) {
      this.settings.readonly = true;
    }
  }
}
