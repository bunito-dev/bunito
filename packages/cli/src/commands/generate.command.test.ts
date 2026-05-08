import { describe, expect, it } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '#common';
import type { Context } from '#context';
import { CLIService } from '#services';
import { GenerateCommand } from './generate.command';

function createContext(mode: 'unknown' | 'standard' | 'monorepo' = 'monorepo'): Context {
  const logs: unknown[][] = [];

  return {
    project: {
      settings: {
        mode,
        apps: new Map([['api', { name: 'api' }]]),
      },
      renderTemplate:
        () =>
        async (...paths: string[]) => [...paths, 'src/main.ts'],
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

describe('GenerateCommand', () => {
  it('registers the generate CLI options', () => {
    const command = getRegisteredCommand('generate');

    expect(command?.command).toBe('generate <element> [name]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('generates apps and libraries in monorepo projects', async () => {
    const context = createContext();

    await new GenerateCommand({ element: 'app', name: 'admin' }, context).run();
    await new GenerateCommand({ element: 'lib', name: 'shared-auth' }, context).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs).toEqual([
      ['App "admin" generated with files:', 'apps', 'admin', 'src/main.ts'],
      ['Library "shared-auth" generated with files:', 'src/main.ts'],
    ]);
  });

  it('reads app and library names interactively', async () => {
    const context = createContext();
    const original = GenerateCommand.readInput;

    GenerateCommand.readInput = async ({ message }) => {
      return message === 'App name' ? 'admin' : 'shared-auth';
    };

    try {
      await new GenerateCommand({ element: 'app' }, context).run();
      await new GenerateCommand({ element: 'lib' }, context).run();
    } finally {
      GenerateCommand.readInput = original;
    }

    expect((context.logger as unknown as { logs: unknown[][] }).logs).toEqual([
      ['App "admin" generated with files:', 'apps', 'admin', 'src/main.ts'],
      ['Library "shared-auth" generated with files:', 'src/main.ts'],
    ]);
  });

  it('rejects unsupported project modes and invalid names', async () => {
    await expectRejectedMessage(
      new GenerateCommand(
        { element: 'app', name: 'api' },
        createContext('unknown'),
      ).run(),
      'Project is not initialized',
    );

    await expectRejectedMessage(
      new GenerateCommand(
        { element: 'app', name: 'api' },
        createContext('standard'),
      ).run(),
      'This command is available only in monorepo projects',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'app', name: 'BadName' }, createContext()).run(),
      'App name must use kebab-case',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'app', name: 'api' }, createContext()).run(),
      'App "api" already exists',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'lib', name: 'BadName' }, createContext()).run(),
      'Library name must use kebab-case',
    );
  });
});
