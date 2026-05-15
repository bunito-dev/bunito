import { describe, expect, it } from 'bun:test';
import yargs from 'yargs';
import { Exception } from '../common';
import type { Context } from '../context';
import { CLIService } from '../services';
import { GenerateCommand } from './generate-command';

function createContext(initialized = true): Context {
  const logs: unknown[][] = [];
  const apps = new Set(['api']);
  const libs = new Set<string>();

  return {
    project: {
      requireInitialized: () => {
        if (!initialized) {
          throw new Exception('Project is not initialized');
        }
      },
      addApp: (name: string) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Exception('App name must be kebab-case');
        }
        if (apps.has(name)) {
          throw new Exception(`App "${name}" already exists`);
        }
        apps.add(name);
      },
      addLib: (name: string) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Exception('Lib name must be kebab-case');
        }
        if (libs.has(name)) {
          throw new Exception(`Lib "${name}" already exists`);
        }
        libs.add(name);
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

describe('GenerateCommand', () => {
  it('registers the generate CLI options', () => {
    const command = getRegisteredCommand('generate');

    expect(command?.command).toBe('generate <element> [name]');
    expect(command?.builder).toBeFunction();

    if (typeof command?.builder === 'function') {
      command.builder(yargs([]));
    }
  });

  it('generates workspace apps and libraries', async () => {
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

  it('rejects uninitialized projects and invalid names', async () => {
    await expectRejectedMessage(
      new GenerateCommand({ element: 'app', name: 'api' }, createContext(false)).run(),
      'Project is not initialized',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'app', name: 'BadName' }, createContext()).run(),
      'App name must be kebab-case',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'app', name: 'api' }, createContext()).run(),
      'App "api" already exists',
    );

    await expectRejectedMessage(
      new GenerateCommand({ element: 'lib', name: 'BadName' }, createContext()).run(),
      'Lib name must be kebab-case',
    );
  });
});
