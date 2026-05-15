import { input } from '@inquirer/prompts';
import { Exception, notEmptySet } from '../common';
import type { Context } from '../context';
import { CLIService, PROJECT_APPS_DIR } from '../services';
import { AppTemplate, ProjectTemplate } from '../templates';
import { AbstractCommand } from './abstract-command';

type InitCommandOptions = {
  project?: string;
  app?: Set<string> | null;
};

export class InitCommand extends AbstractCommand<InitCommandOptions> {
  static readInput = input;

  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated subclass constructors as uncovered.
  constructor(options: InitCommandOptions, context: Context) {
    super(options, context);
  }

  public async run(): Promise<void> {
    const { project, logger, settings } = this.context;
    const { pkgVersion, bunVersion } = settings;
    const { state } = project;

    if (project.isInitialized()) {
      throw new Exception('Project is already initialized');
    }

    let { project: name, app: appNames } = this.options;

    if (!name) {
      name = await this.readInput({
        message: 'Project name',
        required: true,
        prefill: 'tab',
        default: state.name,
      });
    }

    project.initialize(name);

    const apps: string[] = [];

    if (appNames === null) {
      for (let index = 1; ; index++) {
        const app = await this.readInput({
          message: `App name #${index}`,
          required: false,
          default: '',
        });

        if (!app) {
          break;
        }

        project.addApp(app);
        apps.push(app);
      }
    } else if (appNames) {
      for (const app of appNames) {
        project.addApp(app);
        apps.push(app);
      }
    }

    const fileNames = await project.renderTemplate(ProjectTemplate, {
      name,
      pkgVersion,
      bunVersion,
    })();

    fileNames.push(...(await project.renderTemplate(AppTemplate)()));

    for (const app of apps) {
      fileNames.push(
        ...(await project.renderTemplate(AppTemplate)(PROJECT_APPS_DIR, app)),
      );
    }

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
        describe: 'Create an app',
        type: 'string',
        alias: 'a',
        array: true,
        coerce: notEmptySet<string>,
      }),
});
