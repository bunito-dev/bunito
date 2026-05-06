import { CLI, CLICommand } from '../cli';
import { Exception, notEmptySet } from '../common';

export class StartCommand extends CLICommand<{
  apps?: Set<string>;
  watch?: boolean;
  prod?: boolean;
}> {
  public async run(): Promise<void> {
    throw new Exception('Command not implemented yet ;(');
  }
}

CLI.registerCommand(StartCommand, {
  command: 'start [apps...]',
  aliases: ['s'],
  describe: 'Start the app(s)',
  builder: (yargs) =>
    yargs
      .example('$0 start', 'Start all apps')
      .example('$0 start foo', 'Start the foo app')
      .example('$0 start foo bar', 'Start the foo and the bar apps')
      .positional('apps', {
        nullable: true,
        describe: 'App names',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
      })
      .option('watch', {
        describe: 'Watch for changes',
        default: false,
        type: 'boolean',
        alias: 'w',
      })
      .option('prod', {
        describe: 'Run in production mode',
        default: false,
        type: 'boolean',
        alias: 'p',
      }),
});
