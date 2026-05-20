import { describe, expect, it, mock } from 'bun:test';
import { join } from 'node:path';
import type { Context } from '../context';
import { BuildCommand } from './build-command';

function createContext() {
  const writes: string[] = [];
  const logs: unknown[][] = [];
  const app = {
    name: 'root',
    root: true,
    path: '/project',
  };
  const apps = [
    app,
    {
      name: 'api',
      root: false,
      path: '/project/apps/api',
    },
    {
      name: 'worker',
      root: false,
      path: '/project/apps/worker',
    },
  ];
  const getApps = mock((root?: boolean, names?: Set<string> | null) => {
    if (root && names) {
      return apps.filter(({ name }) => name === 'root' || names.has(name));
    }

    if (names) {
      return apps.filter(({ name }) => name !== 'root' && names.has(name));
    }

    return apps;
  });
  const context = {
    project: {
      state: {
        path: '/project',
      },
      requireInitialized: mock(() => undefined),
      getApps,
    },
    fs: {
      ensurePath: mock(async (...paths: string[]) => {
        writes.push(join(...paths));
      }),
      getFile: mock((...paths: string[]) => ({
        write: mock(async (content: string) => {
          writes.push(`${join(...paths)}:${content}`);
        }),
      })),
    },
    logger: {
      br: mock(() => undefined),
      info: mock((...args: unknown[]) => {
        logs.push(args);
      }),
    },
  } as unknown as Context;

  return {
    app,
    apps,
    context,
    logs,
    writes,
  };
}

describe('BuildCommand', () => {
  it('builds all apps by default', async () => {
    const { context, logs, writes } = createContext();
    const originalBuild = Bun.build;
    const build = mock(async () => ({
      success: true,
      outputs: [
        {
          text: async () => 'console.log("main");',
        },
      ],
    }));

    Bun.build = build as unknown as typeof Bun.build;

    try {
      await new BuildCommand({ apps: null, root: false, disable: [] }, context).run();
    } finally {
      Bun.build = originalBuild;
    }

    expect(context.project.getApps).toHaveBeenCalledWith(false, null);
    expect(build).toHaveBeenCalledWith({
      root: '/project',
      target: 'bun',
      minify: true,
      features: ['RUNTIME_ONLY'],
      packages: 'bundle',
      sourcemap: 'inline',
      entrypoints: [join('/project', 'src', 'main.ts')],
      tsconfig: join('/project', 'tsconfig.json'),
    });
    expect(writes).toEqual([
      join('/project', 'out'),
      `${join('/project', 'out', 'main.js')}:console.log("main");`,
      join('/project', 'out', 'api'),
      `${join('/project', 'out', 'api', 'main.js')}:console.log("main");`,
      join('/project', 'out', 'worker'),
      `${join('/project', 'out', 'worker', 'main.js')}:console.log("main");`,
    ]);
    expect(logs).toEqual([
      ['Built "root" app:', join('out', 'main.js')],
      ['Built "api" app:', join('out', 'api', 'main.js')],
      ['Built "worker" app:', join('out', 'worker', 'main.js')],
    ]);
  });

  it('builds selected workspace apps and skips failed outputs', async () => {
    const { context, logs, writes } = createContext();
    const originalBuild = Bun.build;
    const onlyNames = new Set(['api']);
    const build = mock(async () => ({
      success: false,
      outputs: [],
    }));

    Bun.build = build as unknown as typeof Bun.build;

    try {
      await new BuildCommand(
        {
          apps: onlyNames,
          root: false,
          disable: ['minify', 'sourcemap'],
        },
        context,
      ).run();
    } finally {
      Bun.build = originalBuild;
    }

    expect(context.project.getApps).toHaveBeenCalledWith(false, onlyNames);
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        minify: false,
        sourcemap: 'none',
      }),
    );
    expect(writes).toEqual([]);
    expect(logs).toEqual([]);
  });

  it('adds the root app to selected apps with spacing between app logs', async () => {
    const { context } = createContext();
    const originalBuild = Bun.build;
    const build = mock(async () => ({
      success: true,
      outputs: [
        {
          text: async () => 'compiled',
        },
      ],
    }));

    Bun.build = build as unknown as typeof Bun.build;

    try {
      await new BuildCommand(
        {
          apps: new Set(['api']),
          root: true,
          disable: [],
        },
        context,
      ).run();
    } finally {
      Bun.build = originalBuild;
    }

    expect(context.project.getApps).toHaveBeenCalledWith(true, new Set(['api']));
    expect(context.logger.br).toHaveBeenCalledTimes(1);
    expect(context.logger.info).toHaveBeenCalledTimes(2);
  });
});
