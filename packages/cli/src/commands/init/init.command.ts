import { Logger } from '@bunito/logger';
import { notEmptySet } from '../../common';
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

    const pkgInfo = await this.ioService.readPkgInfo();
    const pkgVersion = pkgInfo?.version ?? '0.0.0';
    const bunVersion = pkgInfo?.engines?.bun ?? '>=1.3.10';

    const files = await this.projectService.renderTemplate(ProjectTemplate, {
      name,
      pkgVersion,
      bunVersion,
    })();

    files.push(
      ...(await this.projectService.renderTemplate(AppTemplate, {
        name,
        root: true,
      })()),
    );

    for (const name of apps) {
      files.push(
        ...(await this.projectService.renderTemplate(AppTemplate, {
          name,
          root: false,
        })('apps', name)),
      );
    }

    this.logger.info('Project initialized:', files);
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
