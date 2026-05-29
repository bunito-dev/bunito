import { notEmptySet } from '../../common';
import { CLIException, ProjectService, SystemService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { InitOptions } from './types';

@Command<InitOptions>({
  injects: [SystemService, ProjectService],
})
export class InitCommand implements Command<InitOptions> {
  constructor(
    private readonly systemService: SystemService,
    private readonly projectService: ProjectService,
  ) {}

  async run(options: InitOptions): Promise<void> {
    const { state } = this.projectService;

    if (state.initialized) {
      throw new CLIException('Project is already initialized');
    }

    let { project: name, app: appNames } = options;

    if (!name) {
      name = await this.systemService.readInput({
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
        const app = await this.systemService.readInput({
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

    // render root
    // render apps
    for (const name of apps) {
      //
    }

    console.log('InitCommand', options);
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
