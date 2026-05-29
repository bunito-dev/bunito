import { ProjectService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { GenerateOptions } from './types';

@Command<GenerateOptions>({
  injects: [ProjectService],
})
export class GenerateCommand implements Command<GenerateOptions> {
  constructor(private readonly projectService: ProjectService) {}

  async run(options: GenerateOptions): Promise<void> {
    console.log('GenerateCommand', options);
  }

  build(): CommandBuilt {
    return {
      command: 'generate <element> [name]',
      aliases: ['g'],
      describe: 'Generate an app or library',
      builder: (yargs) =>
        yargs
          .positional('element', {
            describe: 'Resource type',
            type: 'string',
            choices: ['app', 'lib'],
            required: true,
          })
          .positional('name', {
            describe: 'Resource name',
            type: 'string',
          }),
    };
  }
}
