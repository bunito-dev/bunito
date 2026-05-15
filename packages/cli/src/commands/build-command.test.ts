import { describe, expect, it, spyOn } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '../common';
import type { Context } from '../context';
import { CLIService } from '../services';
import { BuildCommand } from './build-command';

async function expectRejectedMessage(
  action: Promise<unknown>,
  message: string,
): Promise<void> {
  let error: unknown;

  try {
    await action;
  } catch (caught) {
    error = caught;
  }

  expect(error).toBeInstanceOf(Exception);
  expect((error as Error).message).toBe(message);
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

describe('BuildCommand', () => {
  it('registers the build CLI options', () => {
    const command = getRegisteredCommand('build');

    expect(command?.command).toBe('build [apps...]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('builds selected apps into the output directory', async () => {
    const ensured: string[] = [];
    const written: { path: string; content: string }[] = [];
    const logs: unknown[][] = [];
    const builds: unknown[] = [];
    const build = spyOn(Bun, 'build').mockImplementation((async (options: unknown) => {
      builds.push(options);

      return {
        success: true,
        outputs: [
          {
            text: async () => 'compiled',
          },
        ],
      };
    }) as unknown as typeof Bun.build);
    const context = {
      project: {
        state: {
          path: '/repo',
        },
        requireInitialized: () => undefined,
        getApps: () => [
          {
            name: 'api',
            main: false,
            path: '/repo/apps/api',
          },
          {
            name: 'admin',
            main: false,
            path: '/repo/apps/admin',
          },
        ],
      },
      fs: {
        ensurePath: async (...paths: string[]) => {
          ensured.push(paths.join('/'));
        },
        getFile: (...paths: string[]) => ({
          write: async (content: string) => {
            written.push({ path: paths.join('/'), content });
            return content.length;
          },
        }),
      },
      logger: {
        br: () => undefined,
        info: (...args: unknown[]) => {
          logs.push(args);
          return undefined;
        },
      },
    } as unknown as Context;

    try {
      await new BuildCommand(
        {
          apps: new Set(['api']),
          minify: true,
          sourcemap: true,
        },
        context,
      ).run();
    } finally {
      build.mockRestore();
    }

    expect(builds).toEqual([
      {
        root: '/repo',
        target: 'bun',
        minify: true,
        packages: 'bundle',
        sourcemap: 'inline',
        entrypoints: ['/repo/apps/api/src/main.ts'],
        tsconfig: '/repo/apps/api/tsconfig.json',
      },
      {
        root: '/repo',
        target: 'bun',
        minify: true,
        packages: 'bundle',
        sourcemap: 'inline',
        entrypoints: ['/repo/apps/admin/src/main.ts'],
        tsconfig: '/repo/apps/admin/tsconfig.json',
      },
    ]);
    expect(ensured).toEqual(['/repo/out/api', '/repo/out/admin']);
    expect(written).toEqual([
      {
        path: '/repo/out/api/main.js',
        content: 'compiled',
      },
      {
        path: '/repo/out/admin/main.js',
        content: 'compiled',
      },
    ]);
    expect(logs).toEqual([
      ['Built "api" app:', 'out/api/main.js'],
      ['Built "admin" app:', 'out/admin/main.js'],
    ]);
  });

  it('builds the main app to the root output directory', async () => {
    const ensured: string[] = [];
    const written: string[] = [];
    const build = spyOn(Bun, 'build').mockImplementation((async () => ({
      success: true,
      outputs: [
        {
          text: async () => 'compiled',
        },
      ],
    })) as unknown as typeof Bun.build);
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
      fs: {
        ensurePath: async (...paths: string[]) => {
          ensured.push(paths.join('/'));
        },
        getFile: (...paths: string[]) => ({
          write: async () => {
            written.push(paths.join('/'));
            return 1;
          },
        }),
      },
      logger: {
        info: () => undefined,
        br: () => undefined,
      },
    } as unknown as Context;

    try {
      await new BuildCommand({}, context).run();
    } finally {
      build.mockRestore();
    }

    expect(ensured).toEqual(['/repo/out']);
    expect(written).toEqual(['/repo/out/main.js']);
  });

  it('rejects unknown projects and empty app selections', async () => {
    await expectRejectedMessage(
      new BuildCommand({}, {
        project: {
          state: {
            path: '/repo',
          },
          requireInitialized: () => {
            throw new Exception('Project is not initialized');
          },
        },
      } as unknown as Context).run(),
      'Project is not initialized',
    );

    await expectRejectedMessage(
      new BuildCommand({}, {
        project: {
          state: {
            path: '/repo',
          },
          requireInitialized: () => undefined,
          getApp: () => {
            throw new Exception('No runnable apps were found');
          },
        },
      } as unknown as Context).run(),
      'No runnable apps were found',
    );
  });
});
