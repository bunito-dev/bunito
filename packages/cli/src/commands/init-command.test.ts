import { describe, expect, it } from 'bun:test';
import type { Context } from '../context';
import { InitCommand } from './init-command';

function createContext(): Context {
  const logs: unknown[][] = [];
  const state = {
    name: 'demo',
  };

  return {
    settings: {
      pkgVersion: 'workspace:*',
      bunVersion: '>=1.3.0',
    },
    project: {
      state,
      isInitialized: () => false,
      initialize: (name: string) => {
        state.name = name;
      },
      addApp: () => undefined,
      renderTemplate:
        () =>
        async (...paths: string[]) => [...paths, 'package.json'],
    },
    logger: {
      logs,
      info: (...args: unknown[]) => {
        logs.push(args);
      },
    },
  } as unknown as Context;
}

describe('InitCommand', () => {
  it('reads project and app names interactively and logs generated files', async () => {
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

    expect((context.logger as unknown as { logs: unknown[][] }).logs).toEqual([
      [
        'Project "demo-app" initialized with files:',
        'package.json',
        'package.json',
        'apps',
        'api',
        'package.json',
      ],
    ]);
  });
});
