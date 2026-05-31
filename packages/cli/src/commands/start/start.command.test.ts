import { describe, expect, it, mock } from 'bun:test';
import { join } from 'node:path';
import type { ProjectService, RunnerService } from '../../core';
import { StartCommand } from './start.command';

describe('StartCommand', () => {
  it('starts selected apps with env files, watch, production, and label options', async () => {
    const processes: unknown[] = [];
    const projectService = {
      state: {
        path: '/project',
      },
      requireInitialized: mock(() => undefined),
      getApps: mock(async () => [
        {
          name: 'api',
          root: false,
          prefix: 'api',
          files: {
            entry: join('apps', 'api', 'src', 'main.ts'),
            env: join('apps', 'api', '.env'),
            out: join('out', 'api', 'main.js'),
          },
        },
      ]),
    } as unknown as ProjectService;
    const runnerService = {
      addProcess: mock((process: unknown) => {
        processes.push(process);
      }),
      startProcesses: mock(async () => 7),
    } as unknown as RunnerService;
    const command = new StartCommand(projectService, runnerService);
    const appNames = new Set(['api']);

    const code = await command.run({
      app: appNames,
      apps: false,
      root: true,
      watch: true,
      prod: true,
      label: 'full',
    });

    expect(code).toBe(7);
    expect(projectService.requireInitialized).toHaveBeenCalled();
    expect(projectService.getApps).toHaveBeenCalledWith({
      appNames,
      includeRoot: true,
      includeApps: false,
    });
    expect(processes).toEqual([
      {
        name: 'api',
        prefix: 'api',
        args: [
          'bun',
          '--cwd=/project',
          `--env-file=${join('/project', 'apps', 'api', '.env.production.local')}`,
          `--env-file=${join('/project', 'apps', 'api', '.env.production')}`,
          `--env-file=${join('/project', 'apps', 'api', '.env.local')}`,
          `--env-file=${join('/project', 'apps', 'api', '.env')}`,
          'run',
          '--feature=RUNTIME_ONLY',
          '--silent',
          '--no-env-file',
          '--watch',
          '--no-clear-screen',
          join('/project', 'apps', 'api', 'src', 'main.ts'),
        ],
        envs: {
          NODE_ENV: 'production',
          BUN_ENV: 'production',
        },
      },
    ]);
    expect(runnerService.startProcesses).toHaveBeenCalledWith('full');
  });

  it('describes the start command options', () => {
    const command = new StartCommand({} as ProjectService, {} as RunnerService);
    const built = command.build();
    const yargs = {
      example: mock(() => yargs),
      positional: mock(() => yargs),
      option: mock(() => yargs),
    };

    if (typeof built.builder === 'function') {
      built.builder(yargs as never);
    }

    expect(built).toMatchObject({
      command: 'start [app...]',
      aliases: ['s'],
      describe: 'Start discovered apps',
    });
    expect(yargs.example).toHaveBeenCalledTimes(4);
    expect(yargs.positional).toHaveBeenCalled();
    expect(yargs.option).toHaveBeenCalledTimes(5);
  });
});
