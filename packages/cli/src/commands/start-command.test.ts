import { describe, expect, it, spyOn } from 'bun:test';
import process from 'node:process';
import yargs from 'yargs';
import { Exception } from '../common';
import type { Context } from '../context';
import { CLIService } from '../services';
import { StartCommand } from './start-command';

async function expectRejectedMessage(
  action: Promise<unknown>,
  message: string,
): Promise<void> {
  try {
    await action;
    throw new Error('Expected action to reject');
  } catch (error) {
    expect(error).toBeInstanceOf(Exception);
    expect((error as Error).message).toBe(message);
  }
}

function getRegisteredCommand(commandName: string) {
  const { commands } = CLIService as unknown as {
    commands: Array<{
      builder: (context: Context) => { command?: string; builder?: unknown };
    }>;
  };

  return commands
    .map((command) => command.builder({} as Context))
    .find((command) => command.command?.startsWith(commandName));
}

describe('StartCommand', () => {
  it('registers the start CLI options', () => {
    const command = getRegisteredCommand('start');

    expect(command?.command).toBe('start [apps...]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('starts selected apps through the spawn service', async () => {
    const processes: unknown[] = [];
    let startOptions: unknown;
    let exitCode: number | string | null | undefined;
    const context = {
      project: {
        state: {
          path: '/repo',
        },
        requireInitialized: () => undefined,
        getApps: (names?: Set<string>) => [
          {
            name: names ? 'api' : 'all',
            main: false,
            path: '/repo/apps/api',
          },
        ],
      },
      spawn: {
        addProcess: (options: unknown) => processes.push(options),
        startProcesses: async (value?: unknown) => {
          startOptions = value;
          return 7;
        },
      },
    } as unknown as Context;
    const exit = spyOn(process, 'exit').mockImplementation(((code) => {
      exitCode = code;
      return undefined as never;
    }) as typeof process.exit);

    try {
      await new StartCommand(
        {
          apps: new Set(['api']),
          watch: true,
          prod: true,
          label: 'full',
        },
        context,
      ).run();
    } finally {
      exit.mockRestore();
    }

    expect(processes).toEqual([
      {
        name: 'api',
        args: [
          'bun',
          '--cwd=/repo',
          '--env-file=/repo/apps/api/.env',
          'run',
          '--watch',
          '/repo/apps/api/src/main.ts',
        ],
        envs: {
          NODE_ENV: 'production',
        },
      },
    ]);
    expect(startOptions).toEqual({
      label: 'full',
    });
    expect(exitCode).toBe(7);
  });

  it('starts the main app without optional flags', async () => {
    const processes: unknown[] = [];
    const context = {
      project: {
        state: {
          path: '/repo',
        },
        requireInitialized: () => undefined,
        getApp: () => ({
          name: 'demo',
          main: true,
          path: '/repo',
        }),
      },
      spawn: {
        addProcess: (options: unknown) => processes.push(options),
        startProcesses: async () => 0,
      },
    } as unknown as Context;
    const exit = spyOn(process, 'exit').mockImplementation(
      (() => undefined as never) as typeof process.exit,
    );

    try {
      await new StartCommand({}, context).run();
    } finally {
      exit.mockRestore();
    }

    expect(processes).toEqual([
      {
        name: 'demo',
        args: ['bun', '--cwd=/repo', '--env-file=/repo/.env', 'run', '/repo/src/main.ts'],
        envs: {},
      },
    ]);
  });

  it('rejects unknown projects', async () => {
    const context = {
      project: {
        state: {
          path: '/repo',
        },
        requireInitialized: () => {
          throw new Exception('Project is not initialized');
        },
      },
    } as unknown as Context;

    await expectRejectedMessage(
      new StartCommand({}, context).run(),
      'Project is not initialized',
    );
  });
});
