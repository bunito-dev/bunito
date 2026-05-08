import { input } from '@inquirer/prompts';
import { Exception, isKebabCase } from '#common';
import type { Context } from '#context';
import { CLIService, PROJECT_APPS_DIR } from '#services';
import { AppTemplate, LibTemplate } from '#templates';
import { Command } from './command';

type GenerateCommandOptions = {
  element?: 'app' | 'lib';
  name?: string;
};

export class GenerateCommand extends Command<GenerateCommandOptions> {
  static readInput = input;

  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated subclass constructors as uncovered.
  constructor(options: GenerateCommandOptions, context: Context) {
    super(options, context);
  }

  public async run(): Promise<void> {
    const { project, logger } = this.context;
    const { settings } = project;

    switch (settings.mode) {
      case 'unknown':
        throw new Exception('Project is not initialized');

      case 'standard':
        throw new Exception('This command is available only in monorepo projects');

      default:
    }

    let { name } = this.options;

    switch (this.options.element) {
      case 'app': {
        const { apps } = settings;

        if (!name) {
          name = await this.readInput({
            message: 'App name',
            default: '',
          });
        }

        if (!isKebabCase(name)) {
          throw new Exception('App name must use kebab-case');
        }

        if (apps.has(name)) {
          throw new Exception(`App "${name}" already exists`);
        }

        const files = await project.renderTemplate(AppTemplate)(PROJECT_APPS_DIR, name);

        logger.info(`App "${name}" generated with files:`, ...files);

        break;
      }

      case 'lib': {
        if (!name) {
          name = await this.readInput({
            message: 'Library name',
            default: '',
          });
        }

        if (!isKebabCase(name)) {
          throw new Exception('Library name must use kebab-case');
        }

        const files = await project.renderTemplate(LibTemplate, {
          name,
        })();

        logger.info(`Library "${name}" generated with files:`, ...files);

        break;
      }
    }
  }

  protected async readInput(options: Parameters<typeof input>[0]): Promise<string> {
    return GenerateCommand.readInput(options);
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
