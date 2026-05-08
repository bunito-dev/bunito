import { input } from '@inquirer/prompts';
import { Exception, isKebabCase, notEmptySet } from '#common';
import type { Context } from '#context';
import { CLIService } from '#services';
import { Command } from './command';

type InitCommandOptions = {
  project?: string;
  app?: Set<string> | null;
};

export class InitCommand extends Command<InitCommandOptions> {
  static readInput = input;

  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated subclass constructors as uncovered.
  constructor(options: InitCommandOptions, context: Context) {
    super(options, context);
  }

  public async run(): Promise<void> {
    const { project, logger } = this.context;
    const { settings } = project;

    if (settings.mode !== 'unknown') {
      throw new Exception(`Project "${settings.name}" is already initialized`);
    }

    let { project: name, app: appNames } = this.options;

    if (!name) {
      name = await this.readInput({
        message: 'Project name',
        required: true,
        prefill: 'tab',
        default: settings.name,
      });
    }

    if (!isKebabCase(name)) {
      throw new Exception('Project name must use kebab-case');
    }

    const apps: string[] = [];

    if (appNames === null) {
      for (let index = 1; ; index++) {
        const app = await this.readInput({
          message: `App name #${index}`,
          required: false,
          default: '',
        });

        if (!app || apps.includes(app)) {
          break;
        }

        apps.push(app);
      }

      if (!apps.length) {
        throw new Exception(
          'Create at least one app or omit --app for a standard project',
        );
      }
    } else if (appNames) {
      apps.push(...appNames);
    }

    for (const [index, app] of apps.entries()) {
      if (!isKebabCase(app)) {
        throw new Exception(`App name #${index + 1} must use kebab-case`);
      }
    }

    const fileNames = await project.create(name, apps);

    logger.info(`Project "${name}" initialized with files:`, ...fileNames);
  }

  protected async readInput(options: Parameters<typeof input>[0]): Promise<string> {
    return InitCommand.readInput(options);
  }
}

CLIService.registerCommand(InitCommand, {
  priority: 1000,
  command: 'init [project]',
  describe: 'Initialize a new project',
  builder: (yargs) =>
    yargs
      .positional('project', {
        describe: 'Project name',
        type: 'string',
        required: true,
      })
      .option('app', {
        describe: 'Create an app in monorepo mode',
        type: 'string',
        alias: 'a',
        array: true,
        coerce: notEmptySet<string>,
      }),
});
