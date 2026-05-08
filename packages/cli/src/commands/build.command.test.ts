import { describe, expect, it, spyOn } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '#common';
import type { Context } from '#context';
import { CLIService } from '#services';
import { BuildCommand } from './build.command';

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
        settings: {
          mode: 'monorepo',
          path: '/repo',
        },
        getApps: () => [
          {
            name: 'api',
            entry: 'apps/api/src/main.ts',
          },
          {
            name: 'admin',
            entry: 'apps/admin/src/main.ts',
          },
        ],
      },
      fs: {
        ensurePath: async (path: string) => {
          ensured.push(path);
        },
        getFile: (path: string, name: string) => ({
          write: async (content: string) => {
            written.push({ path: `${path}/${name}`, content });
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
        sourcemap: 'inline',
        entrypoints: ['apps/api/src/main.ts'],
      },
      {
        root: '/repo',
        target: 'bun',
        minify: true,
        sourcemap: 'inline',
        entrypoints: ['apps/admin/src/main.ts'],
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

  it('builds standard projects to the root output directory', async () => {
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
        settings: {
          mode: 'standard',
          path: '/repo',
        },
        getApps: () => [
          {
            name: 'demo',
            entry: 'src/main.ts',
          },
        ],
      },
      fs: {
        ensurePath: async (path: string) => {
          ensured.push(path);
        },
        getFile: (path: string, name: string) => ({
          write: async () => {
            written.push(`${path}/${name}`);
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
          settings: {
            mode: 'unknown',
          },
        },
      } as unknown as Context).run(),
      'Project is not initialized',
    );

    await expectRejectedMessage(
      new BuildCommand({}, {
        project: {
          settings: {
            mode: 'monorepo',
          },
          getApps: () => [],
        },
      } as unknown as Context).run(),
      'No runnable apps were found',
    );
  });
});
