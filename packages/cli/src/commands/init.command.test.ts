import { describe, expect, it } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '#common';
import type { Context } from '#context';
import { CLIService } from '#services';
import { InitCommand } from './init.command';

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
  settings: { mode: string; name: string } = {
    mode: 'unknown',
    name: 'demo',
  },
): Context {
  const logs: unknown[][] = [];

  return {
    project: {
      settings,
      create: async (name: string, apps: string[]) => [
        'package.json',
        ...apps.map((app) => `apps/${app}/src/main.ts`),
        `project:${name}`,
      ],
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

describe('InitCommand', () => {
  it('registers the init CLI options', () => {
    const command = getRegisteredCommand('init');

    expect(command?.command).toBe('init [project]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('creates standard projects with a provided name', async () => {
    const context = createContext();

    await new InitCommand({ project: 'demo-app' }, context).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs[0]).toEqual([
      'Project "demo-app" initialized with files:',
      'package.json',
      'project:demo-app',
    ]);
  });

  it('creates monorepo projects from provided app names', async () => {
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
      'apps/api/src/main.ts',
      'project:demo-app',
    ]);
  });

  it('rejects empty interactive monorepo app lists', async () => {
    await expectRejectedMessage(
      new TestInitCommand(
        {
          project: 'demo-app',
          app: null,
        },
        createContext(),
        [''],
      ).run(),
      'Create at least one app or omit --app for a standard project',
    );
  });

  it('rejects initialized projects and invalid names', async () => {
    await expectRejectedMessage(
      new InitCommand(
        { project: 'demo-app' },
        createContext({
          mode: 'standard',
          name: 'demo',
        }),
      ).run(),
      'Project "demo" is already initialized',
    );

    await expectRejectedMessage(
      new InitCommand({ project: 'DemoApp' }, createContext()).run(),
      'Project name must use kebab-case',
    );

    await expectRejectedMessage(
      new InitCommand(
        { project: 'demo-app', app: new Set(['valid', 'BadName']) },
        createContext(),
      ).run(),
      'App name #2 must use kebab-case',
    );
  });
});
