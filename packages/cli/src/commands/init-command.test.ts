import { describe, expect, it } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '../common';
import type { Context } from '../context';
import { CLIService } from '../services';
import { InitCommand } from './init-command';

class TestInitCommand extends InitCommand {
  constructor(
    options: ConstructorParameters<typeof InitCommand>[0],
    context: Context,
    private readonly inputs: string[],
  ) {
    super(options, context);
  }

  protected override async readInput(): Promise<string> {
    return this.inputs.shift() ?? '';
  }
}

function createContext(
  settings: { initialized?: boolean; name: string } = {
    name: 'demo',
  },
): Context {
  const logs: unknown[][] = [];

  return {
    settings: {
      pkgVersion: 'workspace:*',
      bunVersion: '>=1.3.11',
    },
    project: {
      state: settings,
      isInitialized: () => settings.initialized ?? false,
      initialize: (name: string) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Exception('Project name must be kebab-case');
        }
        settings.name = name;
      },
      addApp: (name: string) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Exception('App name must be kebab-case');
        }
      },
      renderTemplate:
        (template: { name?: string }) =>
        async (...paths: string[]) => {
          if (paths.length) {
            return [`${paths.join('/')}/src/main.ts`];
          }

          return template.name === 'ProjectTemplate' ? ['package.json'] : ['src/main.ts'];
        },
    },
    logger: {
      logs,
      info: (...args: unknown[]) => {
        logs.push(args);
        return undefined;
      },
    },
  } as unknown as Context;
}

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

describe('InitCommand', () => {
  it('registers the init CLI options', () => {
    const command = getRegisteredCommand('init');

    expect(command?.command).toBe('init [project]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('creates projects with a main app from a provided name', async () => {
    const context = createContext();

    await new InitCommand({ project: 'demo-app' }, context).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs[0]).toEqual([
      'Project "demo-app" initialized with files:',
      'package.json',
      'src/main.ts',
    ]);
  });

  it('creates workspace apps from provided app names', async () => {
    const context = createContext();

    await new InitCommand(
      { project: 'demo-app', app: new Set(['api', 'admin']) },
      context,
    ).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs[0]).toContain(
      'apps/api/src/main.ts',
    );
  });

  it('reads project and app names interactively', async () => {
    const context = createContext();
    const original = InitCommand.readInput;

    InitCommand.readInput = async ({ message }) => {
      switch (message) {
        case 'Project name':
          return 'demo-app';

        case 'App name #1':
          return 'api';

        default:
          return '';
      }
    };

    try {
      await new InitCommand({ app: null }, context).run();
    } finally {
      InitCommand.readInput = original;
    }

    expect((context.logger as unknown as { logs: unknown[][] }).logs[0]).toEqual([
      'Project "demo-app" initialized with files:',
      'package.json',
      'src/main.ts',
      'apps/api/src/main.ts',
    ]);
  });

  it('creates only the main app when interactive app input is empty', async () => {
    const context = createContext();

    await new TestInitCommand(
      {
        project: 'demo-app',
        app: null,
      },
      context,
      [''],
    ).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs[0]).toEqual([
      'Project "demo-app" initialized with files:',
      'package.json',
      'src/main.ts',
    ]);
  });

  it('rejects initialized projects and invalid names', async () => {
    await expectRejectedMessage(
      new InitCommand(
        { project: 'demo-app' },
        createContext({
          initialized: true,
          name: 'demo',
        }),
      ).run(),
      'Project is already initialized',
    );

    await expectRejectedMessage(
      new InitCommand({ project: 'DemoApp' }, createContext()).run(),
      'Project name must be kebab-case',
    );

    await expectRejectedMessage(
      new InitCommand(
        { project: 'demo-app', app: new Set(['valid', 'BadName']) },
        createContext(),
      ).run(),
      'App name must be kebab-case',
    );
  });
});
