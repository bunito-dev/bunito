import { Logger } from '@bunito/logger';
import { CLIException, IOService, ProjectService } from '../../core';
import { AppTemplate, LibTemplate } from '../../templates';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { GenerateOptions } from './types';

@Command<GenerateOptions>({
  injects: [Logger, IOService, ProjectService],
})
export class GenerateCommand implements Command<GenerateOptions> {
  constructor(
    private readonly logger: Logger,
    private readonly ioService: IOService,
    private readonly projectService: ProjectService,
  ) {}

  async run(options: GenerateOptions): Promise<void> {
    this.projectService.requireInitialized();

    const { resource } = options;
    let { name } = options;

    let files: string[];

    switch (resource) {
      case 'app':
        this.projectService.addApp(name);

        if (!name) {
          files = await this.projectService.renderTemplate(AppTemplate, {
            name: this.projectService.state.name,
            root: true,
          })();
        } else {
          files = await this.projectService.renderTemplate(AppTemplate, {
            name,
            root: false,
          })('apps', name);
        }

        this.logger.info(`${name ? name : 'Root'} app generated:`, files);

        break;

      case 'lib':
        if (!name) {
          name = await this.ioService.readInput({
            message: 'Lib name',
          });
        }

        if (!name) {
          throw new CLIException('No lib name provided');
        }

        this.projectService.addLib(name);

        files = await this.projectService.renderTemplate(LibTemplate, { name })(
          'libs',
          name,
        );

        this.logger.info(`${name} lib generated:`, files);

        break;
    }
  }

  build(): CommandBuilt {
    return {
      command: 'generate <resource> [name]',
      aliases: ['g'],
      describe: 'Generate an app or library',
      builder: (yargs) =>
        yargs
          .positional('resource', {
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
