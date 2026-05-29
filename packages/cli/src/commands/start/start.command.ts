import { notEmptySet } from '../../common';
import { ProjectService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { StartOptions } from './types';

@Command<StartOptions>({
  injects: [ProjectService],
})
export class StartCommand implements Command<StartOptions> {
  constructor(private readonly projectService: ProjectService) {}

  async run(options: StartOptions): Promise<void> {
    const { app: appNames, root: includeRoot, apps: includeApps, watch, prod } = options;

    const apps = await this.projectService.getApps({
      appNames,
      includeRoot,
      includeApps,
    });

    console.log('apps', apps);
  }

  build(): CommandBuilt {
    return {
      command: 'start [app...]',
      aliases: ['s'],
      describe: 'Start discovered apps',
      builder: (yargs) =>
        yargs
          .example('$0 start', 'Start every discovered app')
          .example('$0 start foo', 'Start the foo workspace app')
          .example('$0 start foo bar', 'Start the foo and bar workspace apps')
          .example('$0 start --root', 'Include the root app')
          .positional('app', {
            describe: 'Workspace app names to start',
            array: true,
            type: 'string',
            coerce: notEmptySet<string>,
          })
          .option('root', {
            alias: ['r'],
            describe: 'Include the root app',
            type: 'boolean',
            default: false,
          })
          .option('apps', {
            alias: ['a'],
            describe: 'Include apps',
            type: 'boolean',
            default: false,
          })
          .option('watch', {
            alias: ['w'],
            describe: 'Restart on file changes',
            default: false,
            type: 'boolean',
          })
          .option('prod', {
            alias: ['p'],
            describe: 'Set NODE_ENV to production',
            default: false,
            type: 'boolean',
          })
          .option('label', {
            alias: ['l'],
            describe: 'Process label style',
            type: 'string',
            default: 'full',
            choices: ['name', 'pid', 'full'],
          }),
    };
  }
}
