import { resolve } from 'node:path';
import process from 'node:process';
import type { Class, RawObject } from '@bunito/common';
import yargs, { type CommandModule } from 'yargs';
import type { FS, Logger } from '../common';
import { Exception, takeFirst } from '../common';
import { Project } from '../project';
import type { CLICommand } from './cli-command';
import { CLI_PKG_PATH, CLI_PKG_SCHEMA } from './constants';
import type { CLICommandOptions, CLISettings } from './types';

export class CLI {
  private static commands: CLICommandOptions[] = [];

  static registerCommand<TOptions extends RawObject>(
    commandClass: Class<CLICommand<TOptions>, [TOptions, CLI]>,
    options: Omit<CommandModule, 'handler'> &
      Partial<Pick<CLICommandOptions, 'priority'>>,
  ): void {
    const { priority = 0, ...command } = options;

    CLI.commands.push({
      builder: (cli) => ({
        ...command,
        handler: async (args) => {
          await new commandClass(args as RawObject as TOptions, cli).run();
        },
      }),
      priority,
    });
  }

  private readonly state: {
    settings?: CLISettings;
    project?: Project;
  } = {};

  constructor(
    private readonly argv: string[],
    readonly logger: Logger,
    readonly fs: FS,
  ) {}

  get settings(): CLISettings {
    const { settings } = this.state;

    if (!settings) {
      throw new Exception('CLI settings not loaded');
    }

    return settings;
  }

  get project(): Project {
    const { project } = this.state;

    if (!project) {
      throw new Exception('CLI project not loaded');
    }

    return project;
  }

  async load(): Promise<void> {
    const {
      version: pkgVersion,
      engines: { bun: bunVersion },
    } = CLI_PKG_SCHEMA.parse(await this.fs.getFile(CLI_PKG_PATH).json());

    const { debug, cwd: cwdArg } = await yargs(this.argv)
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

    let cwd = process.cwd();

    if (cwdArg) {
      cwd = resolve(cwd, cwdArg);
    }

    this.state.settings = {
      cwd,
      debug,
      pkgVersion: debug ? 'workspace:*' : pkgVersion,
      bunVersion,
    };

    const project = new Project(this);
    await project.load();

    this.state.project = project;
  }

  async runCommand(): Promise<void> {
    let args = yargs(this.argv)
      .scriptName('bunito')
      .option({
        cwd: {
          describe: 'Current working directory',
          type: 'string',
          alias: 'C',
          global: true,
        },
      });

    CLI.commands.sort((a, b) => (a.priority < b.priority ? 1 : -1));

    for (const { builder } of CLI.commands) {
      args = args.command(builder(this));
    }

    await args
      .strictCommands()
      .demandCommand(1, 'You need at least one command before moving on...')
      .completion('completion', 'Generate completion script')
      .help()
      .alias({
        h: 'help',
        v: 'version',
      })
      .fail((msg, err, yargs) => {
        if (Error.isError(err)) {
          this.logger.error(err.message).br();
        } else if (msg) {
          this.logger.error(msg).br();
        } else {
          this.logger.error('Unknown error').br();
        }
        yargs.showHelp('log');
        process.exit(2);
      })
      .parseAsync();
  }
}
