import process from 'node:process';
import { OnAppStart } from '@bunito/app';
import { optional, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import yargs from 'yargs';
import { IOService } from '../core';
import { Command } from './command';

@Provider({
  injects: [optional(Logger), IOService, Command],
})
export class CommandService {
  constructor(
    private readonly logger: Logger | null,
    private readonly ioService: IOService,
    private readonly commands: Command[],
  ) {
    //
  }

  @OnAppStart()
  async runCommand(): Promise<void> {
    const { argv } = this.ioService;

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

    for (const command of this.commands) {
      args = args.command({
        ...command.build(),
        handler: async (argv) => {
          await command.run(argv);
        },
      });
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
          this.logger?.error(err);
        } else if (msg) {
          this.logger?.error(msg);
        } else {
          this.logger?.error('An unexpected CLI error occurred.');
        }

        this.logger?.info(' ');

        yargs.showHelp('log');
        process.exit(2);
      })
      .parseAsync();
  }
}
