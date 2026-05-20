import { join } from 'node:path';
import { notEmptySet } from '../common';
import type { Context } from '../context';
import type { StartProcessOptions } from '../services';
import { CLIService } from '../services';
import { AbstractCommand } from './abstract-command';

type StartCommandOptions = {
  apps: Set<string> | null;
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

    const { apps: onlyNames, prod, label, watch } = this.options;
    const { path } = state;

    const apps = project.getApps(onlyNames);

    const bunArgs = ['bun', `--cwd=${path}`];
    const runArgs = ['run', '--feature=RUNTIME_ONLY'];

    const envs: Record<string, string> = {};

    if (watch) {
      runArgs.push('--watch');
    }

    if (prod) {
      envs.NODE_ENV = 'production';
    } else {
      envs.NODE_ENV = 'development';
    }

    for (const { name, path } of apps) {
      const args = [
        ...bunArgs,
        `--env-file=${join(path, '.env')}`,
        ...runArgs,
        join(path, 'src', 'main.ts'),
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
      .example('$0 start', 'Start all apps')
      .example('$0 start foo', 'Start the foo app')
      .example('$0 start foo bar', 'Start the foo and the bar apps')
      .positional('apps', {
        nullable: true,
        describe: 'App(s) names to run',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
      })
      .option('watch', {
        alias: ['w'],
        describe: 'Watch for changes',
        default: false,
        type: 'boolean',
      })
      .option('prod', {
        alias: ['p'],
        describe: 'Run in production mode',
        default: false,
        type: 'boolean',
      })
      .option('label', {
        alias: ['l'],
        describe: 'Process label',
        type: 'string',
        default: 'full',
        choices: ['name', 'pid', 'full'],
      }),
});
