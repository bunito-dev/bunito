import { describe, expect, it, spyOn } from 'bun:test';
import type { Logger } from '@bunito/logger';
import { RunnerService } from './runner.service';

function streamFrom(text: string): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

function createLogger() {
  const logs: string[] = [];
  const prefixes: (string | undefined)[] = [];
  const logger = {
    clone: () => logger,
    usePrefix: (prefix?: string) => {
      prefixes.push(prefix);
      return logger;
    },
    info: (message: string) => {
      logs.push(message);
    },
  } as unknown as Logger;

  return { logger, logs, prefixes };
}

describe('RunnerService', () => {
  it('spawns processes, prefixes streams, and returns the highest exit code', async () => {
    const calls: { args: string[]; env?: Record<string, string | undefined> }[] = [];
    const spawn = spyOn(Bun, 'spawn').mockImplementation(((
      args: string[],
      options: {
        env?: Record<string, string | undefined>;
      },
    ) => {
      calls.push({
        args,
        env: options.env,
      });

      return {
        pid: args.includes('api') ? 101 : 102,
        stdout: streamFrom(args.includes('api') ? 'ready\npartial' : 'ok\n'),
        stderr: streamFrom(args.includes('api') ? 'warn\n' : ''),
        exited: Promise.resolve(args.includes('api') ? 1 : 0),
      };
    }) as unknown as typeof Bun.spawn);

    try {
      const { logger, logs, prefixes } = createLogger();
      const service = new RunnerService(logger, new TextDecoder(), {
        KEEP: '1',
      });

      service.addProcess({
        name: 'api',
        prefix: 'api',
        args: ['bun', 'api'],
        envs: {
          NODE_ENV: 'test',
        },
      });
      service.addProcess({
        name: 'admin',
        prefix: 'admin',
        args: ['bun', 'admin'],
      });

      const code = await service.startProcesses('full');

      expect(code).toBe(1);
      expect(prefixes).toEqual(['[101] api', '[102] admin']);
      expect(logs).toEqual(
        expect.arrayContaining([
          'ready',
          'partial',
          'warn',
          'ok',
          expect.stringContaining('Process finished with exit code 1'),
          expect.stringContaining('Process finished with exit code 0'),
        ]),
      );
    } finally {
      spawn.mockRestore();
    }

    expect(calls).toEqual([
      {
        args: ['bun', 'api'],
        env: {
          KEEP: '1',
          NODE_ENV: 'test',
        },
      },
      {
        args: ['bun', 'admin'],
        env: {
          KEEP: '1',
        },
      },
    ]);
  });

  it('supports name and pid labels and returns zero when there are no processes', async () => {
    const spawn = spyOn(Bun, 'spawn').mockImplementation((() => ({
      pid: 101,
      stdout: streamFrom(''),
      stderr: streamFrom(''),
      exited: Promise.resolve(0),
    })) as unknown as typeof Bun.spawn);

    try {
      const nameLogger = createLogger();
      const nameService = new RunnerService(nameLogger.logger);
      nameService.addProcess({
        name: 'api',
        prefix: 'api',
        args: ['bun', 'api'],
      });

      expect(await nameService.startProcesses('name')).toBe(0);
      expect(nameLogger.prefixes).toEqual(['api']);

      const pidLogger = createLogger();
      const pidService = new RunnerService(pidLogger.logger);
      pidService.addProcess({
        name: 'api',
        prefix: 'api',
        args: ['bun', 'api'],
      });

      expect(await pidService.startProcesses('pid')).toBe(0);
      expect(pidLogger.prefixes).toEqual(['[101]']);
      expect(await new RunnerService(createLogger().logger).startProcesses('name')).toBe(
        0,
      );
    } finally {
      spawn.mockRestore();
    }
  });
});
