import { describe, expect, it, spyOn } from 'bun:test';
import process from 'node:process';
import { SpawnService } from './spawn-service';

function streamFrom(text: string): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe('SpawnService', () => {
  it('spawns processes, prefixes streams, and returns the highest exit code', async () => {
    const calls: { args: string[]; env?: Record<string, string | undefined> }[] = [];
    const stdout: string[] = [];
    const stderr: string[] = [];
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
        stdout: streamFrom(args.includes('api') ? 'ready\npartial' : 'ok\n'),
        stderr: streamFrom(args.includes('api') ? 'warn\n' : ''),
        exited: Promise.resolve(args.includes('api') ? 1 : 0),
      };
    }) as unknown as typeof Bun.spawn);
    const outWrite = spyOn(process.stdout, 'write').mockImplementation(((
      chunk: string,
    ) => {
      stdout.push(chunk);
      return true;
    }) as typeof process.stdout.write);
    const errWrite = spyOn(process.stderr, 'write').mockImplementation(((
      chunk: string,
    ) => {
      stderr.push(chunk);
      return true;
    }) as typeof process.stderr.write);

    try {
      const service = new SpawnService();

      service.addProcess({
        name: 'api',
        args: ['bun', 'api'],
        envs: {
          NODE_ENV: 'test',
        },
      });
      service.addProcess({
        name: 'admin',
        args: ['bun', 'admin'],
      });

      const code = await service.startProcesses(true);

      expect(code).toBe(1);
    } finally {
      spawn.mockRestore();
      outWrite.mockRestore();
      errWrite.mockRestore();
    }

    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({
      args: ['bun', 'api'],
      env: {
        NODE_ENV: 'test',
      },
    });
    expect(stdout.join('')).toContain('ready');
    expect(stdout.join('')).toContain('partial');
    expect(stdout.join('')).toContain('Process finished with exit code 0');
    expect(stderr.join('')).toContain('warn');
    expect(stderr.join('')).toContain('Process finished with exit code 1');
  });

  it('returns zero when there are no processes', async () => {
    const service = new SpawnService();

    expect(await service.startProcesses()).toBe(0);
  });
});
