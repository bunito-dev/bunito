import { join } from 'node:path';
import { notEmptySet } from '../../common';
import { ProjectService, RunnerService } from '../../core';
import { Command } from '../command';
import type { CommandBuilt } from '../types';
import type { StartOptions } from './types';

@Command<StartOptions>({
  injects: [ProjectService, RunnerService],
})
export class StartCommand implements Command<StartOptions> {
  constructor(
    private readonly projectService: ProjectService,
    private readonly runnerService: RunnerService,
  ) {}

  async run(options: StartOptions): Promise<number> {
    this.projectService.requireInitialized();

    const {
      app: appNames,
      root: includeRoot,
      apps: includeApps,
      watch,
      prod,
      label: labelStyle,
    } = options;

    const { path: rootPath } = this.projectService.state;

    const apps = await this.projectService.getApps({
      appNames,
      includeRoot,
      includeApps,
    });

    const bunEnv = prod ? 'production' : 'development';
    const bunArgs = ['bun', `--cwd=${rootPath}`];
    const runArgs = ['run', '--feature=RUNTIME_ONLY', '--silent', '--no-env-file'];

    const envs: Record<string, string> = {
      NODE_ENV: bunEnv,
      BUN_ENV: bunEnv,
    };

    const envFiles = (envFile: string) => {
      return [
        `--env-file=${envFile}.${bunEnv}.local`,
        `--env-file=${envFile}.${bunEnv}`,
        `--env-file=${envFile}.local`,
        `--env-file=${envFile}`,
      ];
    };

    if (watch) {
      runArgs.push('--watch', '--no-clear-screen');
    }

    for (const { name, prefix, files } of apps) {
      this.runnerService.addProcess({
        name,
        prefix,
        args: [
          ...bunArgs,
          ...envFiles(join(rootPath, files.env)),
          ...runArgs,
          join(rootPath, files.entry),
        ],
        envs,
      });
    }

    return this.runnerService.startProcesses(labelStyle);
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
            default: 'name',
            choices: ['name', 'pid', 'full'],
          }),
    };
  }
}
