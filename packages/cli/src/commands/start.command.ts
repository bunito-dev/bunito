import process from 'node:process';
import type { RawObject } from '@bunito/common';
import { Exception, notEmptySet } from '#common';
import { CLIService } from '#services';
import { Command } from './command';

export class StartCommand extends Command<{
  apps?: Set<string>;
  watch?: boolean;
  prod?: boolean;
  pad?: boolean;
}> {
  public async run(): Promise<void> {
    const { project, spawn } = this.context;
    const { settings } = project;

    if (settings.mode === 'unknown') {
      throw new Exception('Project not initialized');
    }

    const { apps: appNames, prod, pad, watch } = this.options;
    const { path } = settings;

    const bunArgs = ['bun', `--cwd=${path}`];
    const runArgs = ['run'];

    const envs: RawObject<string> = {};

    if (watch) {
      runArgs.push('--watch');
    }

    if (prod) {
      envs.NODE_ENV = 'production';
    }

    const apps = project.getApps(appNames);

    for (const app of apps) {
      const args = [...bunArgs];

      if (app.envs) {
        args.push(`--env-file=${app.envs}`);
      }

      args.push(...runArgs, app.entry);

      spawn.addProcess({
        name: app.name,
        args,
        envs,
      });
    }

    const code = await spawn.startProcesses(pad);

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
        describe: 'App names',
        array: true,
        type: 'string',
        coerce: notEmptySet<string>,
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
      .option('pad', {
        describe: 'Pad prefix with app name',
        default: false,
        type: 'boolean',
      }),
});
