import { CLI, CLICommand } from '../cli';
import { Exception } from '../common';

export class GenerateCommand extends CLICommand<{
  element: string;
  name?: string;
}> {
  public async run(): Promise<void> {
    throw new Exception('Command not implemented yet ;(');
  }
}

CLI.registerCommand(GenerateCommand, {
  priority: 100,
  command: 'generate <element> [name]',
  aliases: ['g'],
  describe: 'Generate a new app or library',
  builder: (yargs) =>
    yargs
      .positional('element', {
        describe: 'Element kind',
        type: 'string',
        choices: ['app', 'lib'],
        required: true,
      })
      .positional('name', {
        describe: 'Element name',
        type: 'string',
      }),
});
