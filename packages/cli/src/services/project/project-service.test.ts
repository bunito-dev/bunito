import { describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Exception } from '../../common';
import type { Context } from '../../context';
import { FSService } from '../fs';
import { ProjectService } from './project-service';

async function createProjectContext(cwd: string, readonly = false): Promise<Context> {
  const context = {
    settings: {
      cwd,
      pkgVersion: 'workspace:*',
      bunVersion: '>=1.3.11',
      readonly,
    },
  } as unknown as Context;

  Object.defineProperty(context, 'fs', {
    value: new FSService(context),
  });

  return context;
}

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

describe('ProjectService', () => {
  it('detects projects with a main app', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("ok");');
    await Bun.write(join(dir, '.env'), 'PORT=3000');

    const service = new ProjectService(await createProjectContext(dir));
    await service.loadState();

    expect(service.state).toEqual({
      initialized: true,
      app: true,
      name: 'demo',
      path: dir,
    });
    expect(service.getApp()).toEqual({
      main: true,
      name: 'demo',
      path: dir,
    });
    expect(() => service.getApps(undefined)).toThrow(
      new Exception('No runnable apps were found'),
    );
  });

  it('detects workspace apps and libraries', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'apps/api/src'), { recursive: true });
    await mkdir(join(dir, 'apps/empty'), { recursive: true });
    await mkdir(join(dir, 'libs/shared'), { recursive: true });
    await Bun.write(join(dir, 'apps/api/src/main.ts'), 'console.log("api");');
    await Bun.write(join(dir, 'libs/shared/index.ts'), 'export {};');

    const service = new ProjectService(await createProjectContext(join(dir, 'apps/api')));
    await service.loadState();

    expect(service.state.name).toBe('demo');
    expect(service.state.path).toBe(dir);
    expect(service.state.apps).toEqual(new Set(['api']));
    expect(service.state.libs).toEqual(new Set(['shared']));
    expect(service.getApps(undefined)).toEqual([
      {
        main: false,
        name: 'api',
        path: join(dir, 'apps/api'),
      },
    ]);
    expect(service.getApps(new Set(['api']))).toHaveLength(1);
  });

  it('reports unknown projects and app selection errors', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = new ProjectService(await createProjectContext(dir));

    await service.loadState();

    expect(service.state).toMatchObject({
      initialized: undefined,
      name: expect.any(String),
      path: dir,
    });
    expect(() => service.requireInitialized()).toThrow(
      new Exception('Project is not initialized'),
    );
  });

  it('rejects workspace app selection when apps are missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(dir);
    await mkdir(join(dir, 'src'), { recursive: true });
    await Bun.write(join(dir, 'src/main.ts'), 'console.log("ok");');

    const standard = new ProjectService(await createProjectContext(dir));
    await standard.loadState();

    expect(() => standard.getApps(new Set(['api']))).toThrow(
      new Exception('No runnable apps were found'),
    );

    const monorepoDir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    await writePackage(monorepoDir);
    await mkdir(join(monorepoDir, 'apps/api/src'), { recursive: true });
    await Bun.write(join(monorepoDir, 'apps/api/src/main.ts'), 'console.log("api");');

    const monorepo = new ProjectService(await createProjectContext(monorepoDir));
    await monorepo.loadState();

    expect(() => monorepo.getApps(new Set(['admin']))).toThrow(
      new Exception('App "admin" was not found'),
    );
  });

  it('adds libraries and rejects invalid or duplicate library names', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = new ProjectService(await createProjectContext(dir));

    await service.loadState();

    service.addLib('shared-auth');

    expect(service.state.libs).toEqual(new Set(['shared-auth']));
    expect(service.hasLib('shared-auth')).toBeTrue();
    expect(() => service.addLib('BadName')).toThrow(
      new Exception('Lib name must be kebab-case'),
    );
    expect(() => service.addLib('shared-auth')).toThrow(
      new Exception('Lib "shared-auth" already exists'),
    );
  });

  it('creates projects and protects existing template paths', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bunito-project-'));
    const service = new ProjectService(await createProjectContext(dir));

    await service.loadState();

    service.initialize('demo');
    service.addApp('api');

    const files = await service.renderTemplate(() => ({
      'package.json': '{}',
      'apps/api/src/app-module.ts': 'export {};',
      'apps/api/src/index.ts': 'export {};',
    }))();

    expect(files).toContain('package.json');
    expect(await Bun.file(join(dir, 'apps/api/src/app-module.ts')).exists()).toBeTrue();
    expect(await Bun.file(join(dir, 'apps/api/src/index.ts')).exists()).toBeTrue();

    try {
      await service.renderTemplate(() => ({
        'apps/api/src/app-module.ts': 'export {};',
      }))();
      throw new Error('Expected duplicate template paths to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Exception);
      expect((error as Error).message).toBe(
        'File "apps/api/src/app-module.ts" already exists',
      );
    }
  });
});
