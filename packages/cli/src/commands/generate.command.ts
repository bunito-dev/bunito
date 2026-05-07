import { input } from '@inquirer/prompts';
import { Exception, isKebabCase } from '#common';
import { CLIService, PROJECT_APPS_DIR } from '#services';
import { AppTemplate, LibTemplate } from '#templates';
import { Command } from './command';

export class GenerateCommand extends Command<{
  element?: 'app' | 'lib';
  name?: string;
}> {
  public async run(): Promise<void> {
    const { project, logger } = this.context;
    const { settings } = project;

    switch (settings.mode) {
      case 'unknown':
        throw new Exception('Project not initialized');

      case 'standard':
        throw new Exception('Supported only in monorepo');

      default:
    }

    let { name } = this.options;

    switch (this.options.element) {
      case 'app': {
        const { apps } = settings;

        if (!name) {
          name = await input({
            message: 'App name',
            default: '',
          });
        }

        if (!isKebabCase(name)) {
          throw new Exception('App name must be kebab-case');
        }

        if (apps.has(name)) {
          throw new Exception(`App ${name} already exists`);
        }

        const files = await project.renderTemplate(AppTemplate, {
          name,
        })(PROJECT_APPS_DIR, name);

        logger.info(`App ${name} generated with files:`, ...files);

        break;
      }

      case 'lib': {
        if (!name) {
          name = await input({
            message: 'Library name',
            default: '',
          });
        }

        if (!isKebabCase(name)) {
          throw new Exception('Library name must be kebab-case');
        }

        const files = await project.renderTemplate(LibTemplate, {
          name,
        })();

        logger.info(`Library ${name} generated with files:`, ...files);

        break;
      }
    }
  }
}

CLIService.registerCommand(GenerateCommand, {
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
