import { describe, expect, it } from 'bun:test';
import type { Context } from '../context';
import { ROOT_APP_NAME } from '../services';
import { GenerateCommand } from './generate-command';

function createContext(): Context {
  const logs: unknown[][] = [];

  return {
    project: {
      requireInitialized: () => undefined,
      addApp: () => undefined,
      addLib: () => undefined,
      renderTemplate:
        () =>
        async (...paths: string[]) => [...paths, 'src/index.ts'],
    },
    logger: {
      logs,
      info: (...args: unknown[]) => {
        logs.push(args);
      },
    },
  } as unknown as Context;
}

describe('GenerateCommand', () => {
  it('generates root apps, workspace apps, and libraries', async () => {
    const context = createContext();

    await new GenerateCommand({ element: 'app', name: ROOT_APP_NAME }, context).run();
    await new GenerateCommand({ element: 'app', name: 'api' }, context).run();
    await new GenerateCommand({ element: 'lib', name: 'shared' }, context).run();

    expect((context.logger as unknown as { logs: unknown[][] }).logs).toEqual([
      ['App "root" generated with files:', 'src/index.ts'],
      ['App "api" generated with files:', 'apps', 'api', 'src/index.ts'],
      ['Library "shared" generated with files:', 'libs', 'shared', 'src/index.ts'],
    ]);
  });

  it('returns when interactive app or library names are empty', async () => {
    const context = createContext();
    const original = GenerateCommand.readInput;

    GenerateCommand.readInput = async () => '';

    try {
      await new GenerateCommand({ element: 'app' }, context).run();
      await new GenerateCommand({ element: 'lib' }, context).run();
    } finally {
      GenerateCommand.readInput = original;
    }

    expect((context.logger as unknown as { logs: unknown[][] }).logs).toEqual([]);
  });
});
