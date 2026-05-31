import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CLIException } from '../cli';
import { IOService } from '../io';
import { ProjectService } from './project.service';

async function writePackage(dir: string): Promise<void> {
  await Bun.write(
    join(dir, 'package.json'),
    JSON.stringify({
      name: 'demo',
      dependencies: {
        '@bunito/bunito': 'workspace:*',
      },
    }),
  );
}

function createService(cwd: string): ProjectService {
  return new ProjectService(new IOService([], cwd));
}

describe('ProjectService', () => {
  it('detects projects with root apps, workspace apps, and libraries', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await mkdir(join(dir, 'apps/api/src'), { recursive: true });
    await mkdir(join(dir, 'apps/empty'), { recursive: true });
    await mkdir(join(dir, 'libs/shared/src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("root");');
    await Bun.write(join(dir, 'apps/api/src/main.ts'), 'console.log("api");');
    await Bun.write(join(dir, 'libs/shared/src/index.ts'), 'export {};');

    const service = createService(join(dir, 'apps/api'));

    await service.loadState();

    expect(service.state).toEqual({
      initialized: true,
      name: 'demo',
      path: dir,
      root: true,
      apps: new Set(['api']),
      libs: new Set(['shared']),
    });
  });

  it('reports unknown projects and requires initialized state for commands', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = createService(dir);

    expect(() => service.state).toThrow(new CLIException('Project state is not loaded'));

    await service.loadState();

    expect(service.state).toMatchObject({
      initialized: undefined,
      name: expect.any(String),
      path: dir,
    });
    expect(() => service.requireInitialized()).toThrow(
      new CLIException('Project is not initialized'),
    );
  });

  it('adds apps and libraries and rejects invalid, duplicate, or reserved names', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = createService(dir);

    await service.loadState();

    service.addApp();
    service.initialize('demo');
    service.addApp('api');
    service.addLib('shared-auth');

    expect(service.state).toMatchObject({
      initialized: true,
      name: 'demo',
      root: true,
      apps: new Set(['api']),
      libs: new Set(['shared-auth']),
    });
    expect(() => service.addApp()).toThrow(
      new CLIException('Project already has a root'),
    );
    expect(() => service.addApp('BadName')).toThrow(
      new CLIException('App name BadName is not kebab-case'),
    );
    expect(() => service.addApp('root')).toThrow(
      new CLIException('Invalid app name root'),
    );
    expect(() => service.addApp('api')).toThrow(
      new CLIException('App api already exists'),
    );
    expect(() => service.addLib('BadName')).toThrow(
      new CLIException('Lib name BadName is not kebab-case'),
    );
    expect(() => service.addLib('shared-auth')).toThrow(
      new CLIException('Lib shared-auth already exists'),
    );
  });

  it('selects apps and assigns prefixes when multiple apps are returned', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await mkdir(join(dir, 'apps/api/src'), { recursive: true });
    await mkdir(join(dir, 'apps/worker/src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("root");');
    await Bun.write(join(dir, 'apps/api/src/main.ts'), 'console.log("api");');
    await Bun.write(join(dir, 'apps/worker/src/main.ts'), 'console.log("worker");');

    const service = createService(dir);

    await service.loadState();

    let selectionError: unknown;
    try {
      await service.getApps({
        includeRoot: false,
        includeApps: true,
        appNames: new Set(['api']),
      });
    } catch (caught) {
      selectionError = caught;
    }

    expect(selectionError).toEqual(
      new CLIException('Cannot include both apps and specific apps'),
    );

    let missingError: unknown;
    try {
      await service.getApps({
        includeRoot: true,
        includeApps: false,
        appNames: new Set(['missing']),
      });
    } catch (caught) {
      missingError = caught;
    }

    expect(missingError).toEqual(new CLIException('App missing not found'));

    const apps = await service.getApps({
      includeRoot: true,
      includeApps: false,
      appNames: new Set(['api']),
    });

    expect(apps).toEqual([
      {
        name: 'root',
        root: true,
        prefix: 'root',
        files: {
          entry: 'src/main.ts',
          env: '.env',
          out: 'out/main.js',
        },
      },
      {
        name: 'api',
        root: false,
        prefix: 'api_',
        files: {
          entry: join('apps', 'api', 'src', 'main.ts'),
          env: join('apps', 'api', '.env'),
          out: join('out', 'api', 'main.js'),
        },
      },
    ]);
  });

  it('synchronizes tsconfig path aliases and rejects unreadable configs', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await mkdir(join(dir, 'apps/api/src'), { recursive: true });
    await mkdir(join(dir, 'libs/shared/src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("root");');
    await Bun.write(join(dir, 'apps/api/src/main.ts'), 'console.log("api");');
    await Bun.write(join(dir, 'libs/shared/src/index.ts'), 'export {};');
    await Bun.write(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: {} }));

    const service = createService(dir);

    await service.loadState();
    await service.synchronize();

    expect(await Bun.file(join(dir, 'tsconfig.json')).json()).toEqual({
      compilerOptions: {
        paths: {
          '@app': ['./src/index.ts'],
          '@apps/api': ['./apps/api/src/index.ts'],
          '@libs/shared': ['./libs/shared/src/index.ts'],
        },
      },
    });

    const missing = createService(await mkdtemp(join(tmpdir(), 'bunito-project-')));

    await missing.loadState();
    let error: unknown;
    try {
      await missing.synchronize();
    } catch (caught) {
      error = caught;
    }

    expect(error).toEqual(new CLIException('Could not read tsconfig.json'));
  });

  it('rejects array-shaped tsconfig files during synchronization', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await Bun.write(join(dir, 'tsconfig.json'), '[]');
    const service = createService(dir);

    await service.loadState();

    let error: unknown;
    try {
      await service.synchronize();
    } catch (caught) {
      error = caught;
    }

    expect(error).toEqual(new CLIException('tsconfig.json is not an object'));
  });

  it('renders templates into the project and skips null views', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const ioService = new IOService([], dir);
    const templateEngine = {
      renderAsync: async (view: string, params: unknown) =>
        JSON.stringify({ view, params }),
    };
    const service = new ProjectService(ioService, templateEngine as never);

    await service.loadState();

    const files = await service.renderTemplate(
      (name: string) => ({
        'src/main.ts': {
          view: 'main.ts',
          params: { name },
        },
        'README.md': null,
      }),
      'demo',
    )();

    expect(files).toEqual(['src/main.ts']);
    expect(await Bun.file(join(dir, 'src/main.ts')).json()).toEqual({
      view: 'main.ts.eta',
      params: {
        name: 'demo',
      },
    });
  });
});
