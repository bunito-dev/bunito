import { Logger } from '@bunito/logger';
import { notEmptySet, toPascalCase } from '../../common';
import { CLIException, IOService, ProjectService } from '../../core';
import { AppTemplate, ProjectTemplate } from '../../templates';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { InitOptions } from './types';

@Command<InitOptions>({
  injects: [Logger, IOService, ProjectService],
})
export class InitCommand implements Command<InitOptions> {
  constructor(
    private readonly logger: Logger,
    private readonly ioService: IOService,
    private readonly projectService: ProjectService,
  ) {}

  async run(options: InitOptions): Promise<void> {
    const { state } = this.projectService;

    if (state.initialized) {
      throw new CLIException('Project already initialized at:', state.path);
    }

    let { project: name, app: appNames } = options;

    if (!name) {
      name = await this.ioService.readInput({
        message: 'Project name',
        required: true,
        prefill: 'tab',
        default: state.name,
      });
    }

    this.projectService.initialize(name);

    const apps: string[] = [];

    if (appNames === null) {
      for (let index = 1; ; index++) {
        const app = await this.ioService.readInput({
          message: `App name #${index}`,
          required: false,
          default: '',
        });

        if (!app) {
          break;
        }

        this.projectService.addApp(app);
        apps.push(app);
      }
    } else if (appNames) {
      for (const app of appNames) {
        this.projectService.addApp(app);
        apps.push(app);
      }
    }

    let files = await this.projectService.renderTemplate(ProjectTemplate, {
      name,
    })();

    this.logger.ok('Project initialized:', files);

    files = await this.projectService.renderTemplate(AppTemplate, {
      name,
      root: true,
    })();

    this.logger.ok('Root app created:', files);

    for (const name of apps) {
      files = await this.projectService.renderTemplate(AppTemplate, {
        name,
        root: false,
      })('apps', name);

      this.logger.ok(`${toPascalCase(name)} app created:`, files);
    }

    await this.projectService.synchronize();
  }

  build(): CommandBuilt {
    return {
      command: 'init [project]',
      describe: 'Initialize a bunito project',
      builder: (yargs) =>
        yargs
          .positional('project', {
            describe: 'Project name',
            type: 'string',
            required: true,
          })
          .option('app', {
            describe: 'Create workspace app',
            type: 'string',
            alias: 'a',
            array: true,
            coerce: notEmptySet<string>,
          }),
    };
  }
}
