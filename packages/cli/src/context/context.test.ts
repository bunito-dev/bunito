import { describe, expect, it } from 'bun:test';
import { Context } from './context';

class TestService {
  constructor(readonly context: Context) {}
}

describe('Context', () => {
  it('loads CLI settings from package metadata and argv', async () => {
    const context = new Context().setService('fs', {
      readPkgInfo: async () => ({
        version: '0.0.8',
        engines: {
          bun: '>=1.3.11',
        },
        dependencies: {},
        devDependencies: {},
        scripts: {},
        type: 'module',
      }),
    } as unknown as Context['fs']);

    await context.loadSettings('/repo', ['--cwd', 'example', '--debug']);

    expect(context.settings).toMatchObject({
      cwd: '/repo/example',
      argv: ['--cwd', 'example', '--debug'],
      pkgVersion: 'workspace:*',
      bunVersion: '>=1.3.11',
      debug: true,
    });
  });

  it('creates and resolves services', () => {
    const context = new Context({
      fs: {
        readPkgInfo: async () => undefined,
      } as unknown as Context['fs'],
    });

    expect(() => context.settings).toThrow('Context settings have not been loaded');
    expect(() => context.cli).toThrow('Service "cli" is not registered');

    context.createService('logger', TestService as never);
    context.setService('project', new TestService(context) as never);
    context.setService('spawn', new TestService(context) as never);

    expect(context.logger).toBeInstanceOf(TestService);
    expect(context.project).toBeInstanceOf(TestService);
    expect(context.spawn).toBeInstanceOf(TestService);
  });
});
