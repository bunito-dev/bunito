import process from 'node:process';
import type { Class, RawObject } from '@bunito/common';
import yargs, { type CommandModule } from 'yargs';
import type { Command } from '#commands';
import type { Context } from '#context';
import type { CLICommand } from './types';

export class CLIService {
  private static commands: CLICommand[] = [];

  static registerCommand<TOptions extends RawObject>(
    commandClass: Class<Command<TOptions>, [TOptions, Context]>,
    options: Omit<CommandModule, 'handler'> & Partial<Pick<CLICommand, 'priority'>>,
  ): void {
    const { priority = 0, ...command } = options;

    CLIService.commands.push({
      builder: (context) => ({
        ...command,
        handler: async (args) => {
          await new commandClass(args as RawObject as TOptions, context).run();
        },
      }),
      priority,
    });
  }

  constructor(private readonly context: Context) {}

  async runCommand(argv: string[]): Promise<void> {
    const { logger } = this.context;

    let args = yargs(argv)
      .scriptName('bunito')
      .option({
        cwd: {
          describe: 'Project working directory',
          type: 'string',
          alias: 'C',
          global: true,
        },
      });

    CLIService.commands.sort((a, b) => (a.priority < b.priority ? 1 : -1));

    for (const { builder } of CLIService.commands) {
      args = args.command(builder(this.context));
    }

    await args
      .strictCommands()
      .demandCommand(1, 'Provide a command to run.')
      .completion('completion', 'Generate completion script')
      .help()
      .alias({
        h: 'help',
        v: 'version',
      })
      .fail((msg, err, yargs) => {
        if (Error.isError(err)) {
          logger.error(err.message).br();
        } else if (msg) {
          logger.error(msg).br();
        } else {
          logger.error('An unexpected CLI error occurred.').br();
        }
        yargs.showHelp('log');
        process.exit(2);
      })
      .parseAsync();
  }
}
