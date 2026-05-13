import { describe, expect, it, spyOn } from 'bun:test';
import process from 'node:process';
import { AbstractCommand } from '../../commands';
import type { Context } from '../../context';
import '../../commands';
import { CLIService } from './cli-service';

class HelloCommand extends AbstractCommand<{ name?: string }> {
  static calledWith: string | undefined;

  async run(): Promise<void> {
    HelloCommand.calledWith = this.options.name;
  }
}

describe('CLIService', () => {
  it('runs registered commands', async () => {
    CLIService.registerCommand(HelloCommand, {
      command: 'hello [name]',
      describe: 'Say hello',
      builder: (yargs) =>
        yargs.positional('name', {
          type: 'string',
        }),
    });

    await new CLIService({} as Context).runCommand(['hello', 'bunito']);

    expect(HelloCommand.calledWith).toBe('bunito');
  });

  it('runs bundled command handlers through the CLI parser', async () => {
    const logs: unknown[][] = [];
    const created: { name: string; apps: string[] }[] = [];
    const generated: unknown[][] = [];
    const builds: unknown[] = [];
    const ensured: string[] = [];
    const written: string[] = [];
    const processes: unknown[] = [];
    let startOptions: unknown;
    const settings = {
      mode: 'unknown',
      name: 'demo',
      path: '/repo',
      apps: new Map([['api', { name: 'api' }]]),
    };
    const logger = {
      info: (...args: unknown[]) => {
        logs.push(args);
        return logger;
      },
      error: (...args: unknown[]) => {
        logs.push(args);
        return logger;
      },
      br: () => undefined,
    };
    const context = {
      project: {
        settings,
        create: async (name: string, apps: string[]) => {
          created.push({ name, apps });
          return ['package.json'];
        },
        getApps: (names?: Set<string>) => [
          {
            name: names?.values().next().value ?? 'api',
            entry: 'apps/api/src/main.ts',
            envs: 'apps/api/.env',
          },
        ],
        renderTemplate:
          (template: unknown, options: unknown) =>
          async (...paths: string[]) => {
            generated.push([template, options, ...paths]);
            return ['src/main.ts'];
          },
      },
      fs: {
        ensurePath: async (path: string) => {
          ensured.push(path);
        },
        getFile: (path: string, name: string) => ({
          write: async (content: string) => {
            written.push(`${path}/${name}:${content}`);
            return content.length;
          },
        }),
      },
      logger,
      spawn: {
        addProcess: (options: unknown) => processes.push(options),
        startProcesses: async (value?: unknown) => {
          startOptions = value;
          return 0;
        },
      },
    } as unknown as Context;
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
    const exit = spyOn(process, 'exit').mockImplementation(
      (() => undefined as never) as typeof process.exit,
    );
    const cli = new CLIService(context);

    try {
      await cli.runCommand(['init', 'demo-app', '--app', 'api']);
      settings.mode = 'monorepo';
      await cli.runCommand(['generate', 'app', 'admin']);
      await cli.runCommand(['build', 'api', '--minify', '--sourcemap']);
      await cli.runCommand(['start', 'api', '--watch', '--prod', '--label', 'full']);
    } finally {
      build.mockRestore();
      exit.mockRestore();
    }

    expect(created).toEqual([
      {
        name: 'demo-app',
        apps: ['api'],
      },
    ]);
    expect(generated).toHaveLength(1);
    expect(builds).toHaveLength(1);
    expect(ensured).toEqual(['/repo/out/api']);
    expect(written).toEqual(['/repo/out/api/main.js:compiled']);
    expect(processes).toEqual([
      {
        name: 'api',
        args: [
          'bun',
          '--cwd=/repo',
          '--env-file=apps/api/.env',
          'run',
          '--watch',
          'apps/api/src/main.ts',
        ],
        envs: {
          NODE_ENV: 'production',
        },
      },
    ]);
    expect(startOptions).toEqual({
      label: 'full',
    });
  });

  it('prints CLI failures and exits with code 2', async () => {
    const messages: string[] = [];
    const logger = {
      error: (message: string) => {
        messages.push(message);
        return logger;
      },
      br: () => undefined,
    };
    const exit = spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    try {
      await new CLIService({ logger } as unknown as Context).runCommand([]);

      expect(messages).toContain('Provide a command to run.');
      expect(exit).toHaveBeenCalledWith(2);
    } finally {
      exit.mockRestore();
    }
  });
});
