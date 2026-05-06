import { CLI, CLICommand } from '../cli';
import { Exception, notEmptySet } from '../common';

export class BuildCommand extends CLICommand<{
  apps?: Set<string>;
}> {
  public async run(): Promise<void> {
    throw new Exception('Command not implemented yet ;(');
  }
}

CLI.registerCommand(BuildCommand, {
  command: 'build [apps...]',
  aliases: ['b'],
  describe: 'Build the app(s)',
  builder: (yargs) =>
    yargs.positional('apps', {
      describe: 'App names',
      array: true,
      type: 'string',
      coerce: notEmptySet<string>,
    }),
});
