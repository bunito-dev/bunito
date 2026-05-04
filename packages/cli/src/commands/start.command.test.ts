import { describe, expect, it, spyOn } from 'bun:test';
import process from 'node:process';
import type { Project } from '../project';
import { StartCommand } from './start.command';

function streamFrom(text: string): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe('StartCommand', () => {
  it('rejects projects without matching apps', async () => {
    const project = {
      getApps: () => [],
    } as unknown as Project;

    try {
      await new StartCommand(project).run({
        apps: undefined,
        watch: false,
        prod: false,
      });
      throw new Error('Expected StartCommand to reject missing apps');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('No apps found');
    }
  });

  it('starts matching apps and prefixes streamed output', async () => {
    const project = {
      getApps: () => [
        {
          name: 'api',
          entry: '/tmp/api.ts',
          prefix: 'api > ',
          envs: {
            PORT: '3000',
          },
        },
        {
          name: 'admin',
          entry: '/tmp/admin.ts',
          prefix: 'admin > ',
        },
      ],
    } as unknown as Project;
    const writes: string[] = [];
    const logs: string[] = [];
    const spawnCalls: {
      args: string[];
      options: unknown;
    }[] = [];
    const spawn = spyOn(Bun, 'spawn').mockImplementation(((
      args: string[],
      options: unknown,
    ) => {
      spawnCalls.push({ args, options });

      return {
        stdout: streamFrom('ready\npartial'),
        stderr: streamFrom('warn\n'),
        exited: Promise.resolve(args.includes('/tmp/api.ts') ? 0 : 1),
      };
    }) as unknown as typeof Bun.spawn);
    const stdoutWrite = spyOn(process.stdout, 'write').mockImplementation(((
      chunk: string,
    ) => {
      writes.push(chunk);
      return true;
    }) as typeof process.stdout.write);
    const stderrWrite = spyOn(process.stderr, 'write').mockImplementation(((
      chunk: string,
    ) => {
      writes.push(chunk);
      return true;
    }) as typeof process.stderr.write);
    const consoleLog = spyOn(console, 'log').mockImplementation((message: string) => {
      logs.push(message);
    });

    try {
      await new StartCommand(project).run({
        apps: new Set(['api', 'admin']),
        watch: true,
        prod: true,
      });
    } finally {
      spawn.mockRestore();
      stdoutWrite.mockRestore();
      stderrWrite.mockRestore();
      consoleLog.mockRestore();
    }

    expect(spawnCalls).toHaveLength(2);
    expect(spawnCalls[0]?.args).toEqual([
      'bun',
      'run',
      '--watch',
      '--no-clear-screen',
      '/tmp/api.ts',
    ]);
    expect(spawnCalls[0]?.options).toMatchObject({
      stdin: 'inherit',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    });
    expect(writes).toHaveLength(6);
    expect(writes).toContain('api > ready\n');
    expect(writes).toContain('api > warn\n');
    expect(writes).toContain('api > partial\n');
    expect(writes).toContain('admin > ready\n');
    expect(writes).toContain('admin > warn\n');
    expect(writes).toContain('admin > partial\n');
    expect(logs).toHaveLength(2);
  });
});
