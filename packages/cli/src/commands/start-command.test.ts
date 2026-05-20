import { describe, expect, it, mock } from 'bun:test';
import { join } from 'node:path';
import type { Context } from '../context';
import { StartCommand } from './start-command';

function createContext() {
  const processes: unknown[] = [];
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
    spawn: {
      addProcess: mock((process: unknown) => {
        processes.push(process);
      }),
      startProcesses: mock(async () => 7),
    },
  } as unknown as Context;

  return {
    app,
    apps,
    context,
    processes,
  };
}

async function runWithoutExiting(command: StartCommand): Promise<number | undefined> {
  const originalExit = process.exit;
  let exitCode: number | undefined;

  process.exit = mock((code?: string | number | null | undefined) => {
    exitCode = typeof code === 'number' ? code : undefined;

    return undefined as never;
  });

  try {
    await command.run();
  } finally {
    process.exit = originalExit;
  }

  return exitCode;
}

describe('StartCommand', () => {
  it('starts all apps by default in development mode', async () => {
    const { context, processes } = createContext();

    const exitCode = await runWithoutExiting(
      new StartCommand(
        {
          apps: null,
          root: false,
          label: 'full',
        },
        context,
      ),
    );

    expect(context.project.getApps).toHaveBeenCalledWith(false, null);
    expect(processes).toEqual([
      {
        name: 'root',
        args: [
          'bun',
          '--cwd=/project',
          `--env-file=${join('/project', '.env')}`,
          'run',
          '--feature=RUNTIME_ONLY',
          join('/project', 'src', 'main.ts'),
        ],
        envs: {
          NODE_ENV: 'development',
        },
      },
      {
        name: 'api',
        args: [
          'bun',
          '--cwd=/project',
          `--env-file=${join('/project/apps/api', '.env')}`,
          'run',
          '--feature=RUNTIME_ONLY',
          join('/project/apps/api', 'src', 'main.ts'),
        ],
        envs: {
          NODE_ENV: 'development',
        },
      },
      {
        name: 'worker',
        args: [
          'bun',
          '--cwd=/project',
          `--env-file=${join('/project/apps/worker', '.env')}`,
          'run',
          '--feature=RUNTIME_ONLY',
          join('/project/apps/worker', 'src', 'main.ts'),
        ],
        envs: {
          NODE_ENV: 'development',
        },
      },
    ]);
    expect(context.spawn.startProcesses).toHaveBeenCalledWith({
      label: 'full',
    });
    expect(exitCode).toBe(7);
  });

  it('starts selected apps with watch and production flags', async () => {
    const { context, processes } = createContext();
    const onlyNames = new Set(['api']);

    await runWithoutExiting(
      new StartCommand(
        {
          apps: onlyNames,
          root: false,
          label: 'name',
          prod: true,
          watch: true,
        },
        context,
      ),
    );

    expect(context.project.getApps).toHaveBeenCalledWith(false, onlyNames);
    expect(processes).toEqual([
      {
        name: 'api',
        args: [
          'bun',
          '--cwd=/project',
          `--env-file=${join('/project/apps/api', '.env')}`,
          'run',
          '--feature=RUNTIME_ONLY',
          '--watch',
          join('/project/apps/api', 'src', 'main.ts'),
        ],
        envs: {
          NODE_ENV: 'production',
        },
      },
    ]);
  });

  it('adds the root app to selected apps', async () => {
    const { context, processes } = createContext();
    const onlyNames = new Set(['api']);

    await runWithoutExiting(
      new StartCommand(
        {
          apps: onlyNames,
          root: true,
        },
        context,
      ),
    );

    expect(context.project.getApps).toHaveBeenCalledWith(true, onlyNames);
    expect(processes.map((process) => (process as { name: string }).name)).toEqual([
      'root',
      'api',
    ]);
  });
});
