import { join } from 'node:path';
import { notEmptySet } from '../common';
import type { Context } from '../context';
import type { ProjectApp, StartProcessOptions } from '../services';
import { CLIService, PROJECT_ENTRY_FILE, PROJECT_ENVS_FILE } from '../services';
import { AbstractCommand } from './abstract-command';

type StartCommandOptions = {
  apps?: Set<string>;
  all?: boolean;
  watch?: boolean;
  prod?: boolean;
} & StartProcessOptions;

export class StartCommand extends AbstractCommand<StartCommandOptions> {
  // biome-ignore lint/complexity/noUselessConstructor: Bun coverage counts generated subclass constructors as uncovered.
  constructor(options: StartCommandOptions, context: Context) {
    super(options, context);
  }

  public async run(): Promise<void> {
    const { project, spawn } = this.context;
    const { state } = project;

    project.requireInitialized();

    const { apps: onlyNames, all, prod, label, watch } = this.options;
    const { path } = state;

    let apps: ProjectApp[];

    if (all || onlyNames) {
      apps = project.getApps(onlyNames);
    } else {
      apps = [project.getApp()];
    }

    const bunArgs = ['bun', `--cwd=${path}`];
    const runArgs = ['run'];

    const envs: Record<string, string> = {};

    if (watch) {
      runArgs.push('--watch');
    }

    if (prod) {
      envs.NODE_ENV = 'production';
    }

    for (const { name, path } of apps) {
      const args = [
        ...bunArgs,
        `--env-file=${join(path, PROJECT_ENVS_FILE)}`,
        ...runArgs,
        join(path, PROJECT_ENTRY_FILE),
      ];

      spawn.addProcess({
        name,
        args,
        envs,
      });
    }

    const code = await spawn.startProcesses({
      label,
    });

    process.exit(code);
  }
}

CLIService.registerCommand(StartCommand, {
  command: 'start [apps...]',
  aliases: ['s'],
  describe: 'Start the app(s)',
  builder: (yargs) =>
    yargs
      .example('$0 start', 'Start the main app')
      .example('$0 start foo', 'Start the foo app')
      .example('$0 start foo bar', 'Start the foo and the bar apps')
      .positional('apps', {
        nullable: true,
        describe: 'App names',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
      })
      .option('all', {
        describe: 'Start all workspace apps',
        default: false,
        type: 'boolean',
        alias: 'a',
      })
      .option('watch', {
        describe: 'Watch for changes',
        default: false,
        type: 'boolean',
        alias: 'w',
      })
      .option('prod', {
        describe: 'Run in production mode',
        default: false,
        type: 'boolean',
        alias: 'p',
      })
      .option('label', {
        describe: 'App label format',
        default: 'full',
        type: 'string',
        choices: ['name', 'pid', 'full'],
      }),
});
