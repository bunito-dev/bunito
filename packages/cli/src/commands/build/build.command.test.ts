import { describe, expect, it, mock, spyOn } from 'bun:test';
import { join } from 'node:path';
import type { Logger } from '@bunito/logger';
import type { IOService, ProjectService } from '../../core';
import { BuildCommand } from './build.command';

function createLogger() {
  const ok = mock(() => undefined);
  const track = mock(() => ({
    usePrefix: mock(() => ({
      ok,
    })),
  }));

  return {
    logger: { track } as unknown as Logger,
    ok,
    track,
  };
}

describe('BuildCommand', () => {
  it('builds selected apps and writes bundled output', async () => {
    const { logger, ok, track } = createLogger();
    const writes: unknown[] = [];
    const ioService = {
      getFile: mock(() => ({
        write: mock(async (content: string) => {
          writes.push(content);
          return content.length;
        }),
      })),
    } as unknown as IOService;
    const apps = [
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
    ];
    const projectService = {
      state: {
        path: '/project',
      },
      requireInitialized: mock(() => undefined),
      getApps: mock(async () => apps),
    } as unknown as ProjectService;
    const build = spyOn(Bun, 'build').mockImplementation((async () => ({
      success: true,
      outputs: [
        {
          text: async () => 'compiled',
        },
      ],
    })) as unknown as typeof Bun.build);

    try {
      const command = new BuildCommand(logger, ioService, projectService);

      await command.run({
        app: new Set(['api']),
        apps: false,
        root: true,
        disable: new Set(['minify']),
      });

      expect(projectService.requireInitialized).toHaveBeenCalled();
      expect(projectService.getApps).toHaveBeenCalledWith({
        appNames: new Set(['api']),
        includeRoot: true,
        includeApps: false,
      });
      expect(build).toHaveBeenCalledWith({
        root: '/project',
        target: 'bun',
        minify: false,
        features: ['RUNTIME_ONLY'],
        packages: 'bundle',
        sourcemap: 'inline',
        entrypoints: [join('/project', 'apps', 'api', 'src', 'main.ts')],
        tsconfig: join('/project', 'tsconfig.json'),
      });
      expect(ioService.getFile).toHaveBeenCalledWith(
        '/project',
        join('out', 'api', 'main.js'),
      );
      expect(writes).toEqual(['compiled']);
      expect(track).toHaveBeenCalled();
      expect(ok).toHaveBeenCalledWith('App built:', [join('out', 'api', 'main.js')]);
    } finally {
      build.mockRestore();
    }
  });

  it('describes the build command options', () => {
    const command = new BuildCommand({} as Logger, {} as IOService, {} as ProjectService);
    const built = command.build();
    const yargs = {
      positional: mock(() => yargs),
      option: mock(() => yargs),
    };

    if (typeof built.builder === 'function') {
      built.builder(yargs as never);
    }

    expect(built).toMatchObject({
      command: 'build [app...]',
      aliases: ['b'],
      describe: 'Build discovered apps',
    });
    expect(yargs.positional).toHaveBeenCalled();
    expect(yargs.option).toHaveBeenCalledTimes(3);
  });
});
